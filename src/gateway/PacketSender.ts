import { DiscordPacket, DiscordPacketTypes } from "./GatewayTypes";
import { GatewayClient } from "./GatewayClient";

export class PacketSender {
  gatewayClient: GatewayClient;

  constructor(gatewayClient: GatewayClient) {
    this.gatewayClient = gatewayClient;
  }

  buildPacket(op: DiscordPacketTypes, data: any = null): DiscordPacket {
    return {
      d: data,
      op: op,
      s: null,
      t: null,
    };
  }

  sendRaw(data: DiscordPacket) {
    if (!this.gatewayClient.connected) {
      // TODO debug log
      // attempted to send packet while not connected to gateway
      return;
    }
    this.gatewayClient.wsClient?.send(JSON.stringify(data));
  }

  sendHeartbeat() {
    this.sendRaw(
      this.buildPacket(
        DiscordPacketTypes.HEARTBEAT,
        this.gatewayClient.sequence
      )
    );
  }

  // TODO intents
  sendIdentify() {
    this.sendRaw(
      this.buildPacket(DiscordPacketTypes.IDENTIFY, {
        token: this.gatewayClient.client.options.token,
        intents: 0,
        properties: {
          $os: this.gatewayClient.client.options.clientSettings?.os,
          $browser: this.gatewayClient.client.options.clientSettings?.browser,
          $device: this.gatewayClient.client.options.clientSettings?.device,
        },
        presence: {
          afk: false,
          status: "online",
          activities: [],
        },
      })
    );
  }
}
