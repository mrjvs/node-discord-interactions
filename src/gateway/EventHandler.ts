import { LogType } from "../Logger";
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
      INTERACTION_CREATE: this.eventInteractionCreate,
    };
    Object.keys(this.eventMap).forEach(
      (key: string) => (this.eventMap[key] = this.eventMap[key].bind(this))
    );
  }

  handleEvent(packet: DiscordPacket): void {
    if (packet.op !== DiscordPacketTypes.EVENT) return;
    if (!packet.t || !this.eventMap[packet.t]) {
      this.gatewayClient.client.logger.logItem({
        type: LogType.DEBUG,
        message: `Unhandled event: ${packet.t}`,
      });
      return;
    }
    this.eventMap[packet.t](packet.d);
  }

  private eventGuildCreate(data: any): void {}

  private eventReady(data: any): void {
    this.gatewayClient._loginPromise?.resolve();
    this.gatewayClient.client.logger.logItem({
      type: LogType.INFO,
      message: `Gateway ready (step 3/3), logged in as ${data.user.username}#${data.user.discriminator}`,
    });
  }

  private eventInteractionCreate(data: any): void {
    this.gatewayClient.client.interactions._runInteraction(data);
  }
}
