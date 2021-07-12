import WebSocket = require("ws");
import { DiscordClient } from "../Client";
import { LogType } from "../Logger";
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
  _loginPromise: any | undefined | boolean;

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
        this.client.logger.logItem({
          type: LogType.WARN,
          message: `Received unparsable packet from gateway`,
        });
        return;
      }
      this.packetHandler.handlePacket(parsed);
    });
    this.wsClient?.on("open", () => {
      this.connected = true;
    });
    this.wsClient?.on("close", () => {
      // TODO temp
      this.client.logger.logItem({
        type: LogType.ERROR,
        message: `Disconnected from the gateway`,
      });
      this.connected = false;
    });
    // TODO reconnection logic
  }

  async login(): Promise<void> {
    if (this._loginPromise) throw new Error("Already logging in");
    this._loginPromise = true;
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

    this._loginPromise = {
      resolve: null,
    };
    const promise = new Promise((resolve) => {
      this._loginPromise.resolve = resolve;
    });

    await new Promise((resolve, reject) => {
      this.wsClient = new WebSocket(data.url);
      this.wsClient.once("open", () => {
        this.wsClient?.removeAllListeners();
        this.connected = true;
        this.setupListeners();
        this.client.logger.logItem({
          type: LogType.INFO,
          message: `Connected to gateway (step 1/3)`,
        });
        resolve(true);
      });
      this.wsClient.once("close", (code: number, reason: string) => {
        this.wsClient?.removeAllListeners();
        this.wsClient = undefined;
        this.client.logger.logItem({
          type: LogType.INFO,
          message: `Failed to connect to gateway`,
        });
        reject(new GatewayConnectionError(code, reason));
      });
    });

    // wait for ready
    await promise;
    this._loginPromise = true;
  }
}
