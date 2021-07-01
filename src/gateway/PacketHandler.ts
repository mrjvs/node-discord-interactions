import {
  DiscordPacket,
  DiscordPacketTypeReceiveList,
  DiscordPacketTypes,
} from "./GatewayTypes";
import { GatewayClient } from "./GatewayClient";
import { EventHandler } from "./EventHandler";

interface HelloPacketData {
  heartbeat_interval: number;
}

export class PacketHandler {
  gatewayClient: GatewayClient;
  eventHandler: EventHandler;

  constructor(gatewayClient: GatewayClient) {
    this.gatewayClient = gatewayClient;
    this.eventHandler = new EventHandler(gatewayClient);
  }

  handlePacket(packet: DiscordPacket) {
    if (packet.s !== undefined && packet.s !== null)
      this.gatewayClient.sequence = packet.s;
    if (!DiscordPacketTypeReceiveList.includes(packet.op)) {
      // TODO debug log
      // unhandled packet type
      return;
    }
    if (packet.op === DiscordPacketTypes.HELLO) this.handlePacket(packet.d);
    else if (packet.op === DiscordPacketTypes.HEARTBEAT_ACK)
      this.handlePacket(packet.d);
  }

  handleHello(data: HelloPacketData) {
    this.gatewayClient.heartbeatManager.startHeartbeat(data.heartbeat_interval);
  }

  handleHeartbeatAck() {
    this.gatewayClient.heartbeatManager.receivedAck();
  }
}
