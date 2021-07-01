import { GatewayClient } from "./GatewayClient";
import { DiscordPacket, DiscordPacketTypes } from "./GatewayTypes";

export class EventHandler {
  gatewayClient: GatewayClient;
  eventMap: {
    [key: string]: (data: any) => void;
  };

  constructor(gatewayClient: GatewayClient) {
    this.gatewayClient = gatewayClient;
    this.eventMap = {
      GUILD_CREATE: this.eventGuildCreate,
    };
  }

  handleEvent(packet: DiscordPacket): void {
    if (packet.op !== DiscordPacketTypes.EVENT) return;
    if (!packet.t || !this.eventMap[packet.t]) {
      // TODO debug log
      // unhandled gateway event
      return;
    }
    this.eventMap[packet.t](packet.d);
  }

  private eventGuildCreate(data: any): void {
    console.log("Guild was created", data);
  }
}
