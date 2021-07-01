import { Response } from "node-fetch";
import { UnauthorizedException } from "../Request";

export class GatewayConnectionError extends Error {
  code: number;

  constructor(code: number, reason: string) {
    super(reason);
    Object.setPrototypeOf(this, GatewayConnectionError.prototype);
    this.code = code;
  }
}

export class InvalidTokenException extends UnauthorizedException {
  constructor(res: Response, data: any) {
    super(res, data, "Invalid token used to connect to gateway");
    Object.setPrototypeOf(this, InvalidTokenException.prototype);
  }
}

export interface DiscordPacket {
  op: number;
  d: any;
  s?: number | null;
  t?: string | null;
}

export enum DiscordPacketTypes {
  EVENT = 0,
  HEARTBEAT = 1,
  IDENTIFY = 2,
  PRESENCE_UPDATE = 3,
  VOICE_STATE_UPDATE = 4,
  RESUME = 6,
  RECONNECT = 7,
  REQUEST_GUILD_MEMBERS = 8,
  INVALID_SESSION = 9,
  HELLO = 10,
  HEARTBEAT_ACK = 11,
}

export const DiscordPacketTypeReceiveList = [
  DiscordPacketTypes.HELLO,
  DiscordPacketTypes.HEARTBEAT_ACK,
  DiscordPacketTypes.EVENT,
];
