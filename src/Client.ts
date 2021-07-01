import { GatewayClient } from "./gateway/GatewayClient";
import { InteractionCollection } from "./interaction/InteractionCollection";
import { MessageBuilder } from "./message/MessageBuilder";
import { doFetch, HttpMethods } from "./Request";
import { Utils } from "./utils";

export enum ClientStatus {
  ONLINE = "online",
  DO_NOT_DISTURB = "dnd",
  INVISIBLE = "invisible",
  IDLE = "idle",
  OFFLINE = "offline",
}

export interface DiscordClientSettings {
  device: string;
  browser: string;
  os: string;
}

export interface DiscordSettings {
  token: string;
  discordUrl?: string;
  idPrefix?: string;
  clientSettings?: DiscordClientSettings;
  startupPresence?: ClientStatus;
}

const DiscordSettingsDefaults: any = {
  discordUrl: "https://discord.com/api/v9",
  idPrefix: "interactions:id",
  clientSettings: {
    os: process.platform,
    browser: "node-discord-interactions",
    device: "node-discord-interactions",
  },
  startupPresence: ClientStatus.ONLINE,
};

export class DiscordClient {
  options: DiscordSettings;
  utils: Utils;

  constructor(settings: DiscordSettings) {
    this.options = { ...DiscordSettingsDefaults, ...settings };
    this.gateway = new GatewayClient(this);
    this.utils = new Utils(this);
    this.interactions = new InteractionCollection(this);
  }

  // parts
  gateway: GatewayClient;
  interactions: InteractionCollection;

  // TODO temp
  async sendMessage(channelId: string, message: MessageBuilder): Promise<any> {
    const d = await doFetch(`/channels/${channelId}/messages`, {
      method: HttpMethods.POST,
      auth: true,
      client: this,
      body: message.raw,
    });
    return d;
  }
}
