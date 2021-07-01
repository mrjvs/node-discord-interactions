import { GatewayClient } from "./GatewayClient";

export class HeartbeatManager {
  gatewayClient: GatewayClient;
  heartbeatInterval: ReturnType<typeof setInterval> | null;
  gotAck: boolean;
  currentInterval: number;

  constructor(gatewayClient: GatewayClient) {
    this.gatewayClient = gatewayClient;
    this.heartbeatInterval = null;
    this.gotAck = false;
    this.currentInterval = 0;
  }

  startHeartbeat(interval: number) {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.gotAck = true;
    this.heartbeatInterval = setInterval(() => {
      if (!this.gotAck) {
        // TODO debug log
        // TODO terminate immediately
      }
      this.gatewayClient.packetSender.sendHeartbeat();
      this.gotAck = false;
    }, interval);
    this.currentInterval = interval;
  }

  receivedAck() {
    this.gotAck = true;
  }
}
