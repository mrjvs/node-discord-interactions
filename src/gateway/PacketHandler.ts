import {
  DiscordPacket,
  DiscordPacketTypeReceiveList,
  DiscordPacketTypes,
} from "./GatewayTypes";
import { GatewayClient } from "./GatewayClient";
import { EventHandler } from "./EventHandler";
import { LogType } from "../Logger";

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
      this.gatewayClient.client.logger.logItem({
        type: LogType.DEBUG,
        message: `Unhandled packet type: ${packet.op}`,
      });
      return;
    }
    if (packet.op === DiscordPacketTypes.HELLO) this.handleHello(packet.d);
    else if (packet.op === DiscordPacketTypes.HEARTBEAT_ACK)
      this.handleHeartbeatAck();
    else if (packet.op === DiscordPacketTypes.EVENT)
      this.eventHandler.handleEvent(packet);
  }

  handleHello(data: HelloPacketData) {
    this.gatewayClient.heartbeatManager.startHeartbeat(data.heartbeat_interval);
    this.gatewayClient.packetSender.sendIdentify();
  }

  handleHeartbeatAck() {
    this.gatewayClient.heartbeatManager.receivedAck();
  }
}
