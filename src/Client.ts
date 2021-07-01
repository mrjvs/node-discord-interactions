import { GatewayClient } from "./gateway/GatewayClient";
import { MessageBuilder } from "./message/MessageBuilder";
import { doFetch, HttpMethods } from "./Request";

export interface DiscordSettings {
  token: string;
  connectGateway?: boolean;
  discordUrl?: string;
}

const DiscordSettingsDefaults: any = {
  connectGateway: false,
  discordUrl: "https://discord.com/api/v9",
};

export class DiscordClient {
  options: DiscordSettings;

  constructor(settings: DiscordSettings) {
    this.options = { ...DiscordSettingsDefaults, ...settings };
    this.gateway = new GatewayClient(this);
  }

  // parts
  gateway: GatewayClient;

  // TODO temp
  async sendMessage(channelId: string, message: MessageBuilder): Promise<void> {
    await doFetch(`/channels/${channelId}/messages`, {
      method: HttpMethods.POST,
      auth: true,
      client: this,
      body: message.raw,
    });
  }
}
