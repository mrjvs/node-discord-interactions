import WebSocket = require("ws");
import { DiscordClient } from "../Client";
import { doFetch, UnauthorizedException } from "../Request";
import {
  DiscordPacket,
  GatewayConnectionError,
  InvalidTokenException,
} from "./GatewayTypes";
import { HeartbeatManager } from "./heartbeatManager";
import { PacketHandler } from "./PacketHandler";
import { PacketSender } from "./PacketSender";

export class GatewayClient {
  client: DiscordClient;
  wsClient?: WebSocket;
  sequence: number;
  packetHandler: PacketHandler;
  packetSender: PacketSender;
  heartbeatManager: HeartbeatManager;
  connected: boolean;

  constructor(client: DiscordClient) {
    this.packetHandler = new PacketHandler(this);
    this.packetSender = new PacketSender(this);
    this.heartbeatManager = new HeartbeatManager(this);
    this.client = client;
    this.sequence = 0;
    this.connected = false;
  }

  private setupListeners() {
    this.wsClient?.on("message", (text: string) => {
      let parsed: DiscordPacket;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        // TODO debug log
        // failed to parse
        return;
      }
      this.packetHandler.handlePacket(parsed);
    });
    this.wsClient?.on("open", () => {
      this.connected = true;
    });
    this.wsClient?.on("close", () => {
      this.connected = false;
    });
    // TODO reconnection logic
  }

  async login(): Promise<void> {
    const { data } = await doFetch("/gateway/bot", {
      client: this.client,
      auth: true,
    }).catch((err: Error) => {
      if (err.constructor === UnauthorizedException)
        throw new InvalidTokenException(
          (err as UnauthorizedException).res,
          (err as UnauthorizedException).data
        );
      throw err;
    });

    await new Promise((resolve, reject) => {
      this.wsClient = new WebSocket(data.url);
      this.wsClient.once("open", () => {
        this.wsClient?.removeAllListeners();
        this.connected = true;
        this.setupListeners();
        resolve(true);
      });
      this.wsClient.once("close", (code: number, reason: string) => {
        this.wsClient?.removeAllListeners();
        this.wsClient = undefined;
        reject(new GatewayConnectionError(code, reason));
      });
    });
  }
}
