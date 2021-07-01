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
      READY: this.eventReady,
    };
    Object.keys(this.eventMap).forEach(
      (key: string) => (this.eventMap[key] = this.eventMap[key].bind(this))
    );
  }

  handleEvent(packet: DiscordPacket): void {
    if (packet.op !== DiscordPacketTypes.EVENT) return;
    if (!packet.t || !this.eventMap[packet.t]) {
      // TODO debug log
      // unhandled gateway event
      console.log(packet.t, packet.d);
      return;
    }
    this.eventMap[packet.t](packet.d);
  }

  private eventGuildCreate(data: any): void {
    console.log("Guild was created", data);
  }

  private eventReady(data: any): void {
    this.gatewayClient._loginPromise?.resolve();
    console.log("Ready event", data);
  }
}
