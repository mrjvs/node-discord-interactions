import { DiscordClient } from "../Client";
import { MessageBuilder } from "../message/MessageBuilder";
import { doFetch, HttpMethods } from "../Request";

export enum InteractionType {
  COMPONENTS = "components",
  SLASHCOMMANDS = "slashcommands",
  PING = "ping",
}

const interactionMap: any = {
  "1": "ping",
  "2": "slashcommands",
  "3": "components",
};

export interface IInteraction {
  id: string;
  application_id: string;
  type: number;
  token: string;
  version: number;

  data?: any;
  guild_id?: string;
  channel_id?: string;
  member?: any;
  user?: any;
  message?: any;
}

class InteractionResponse {
  #type: InteractionType;
  #client: DiscordClient;
  #raw: any; // parse raw data

  // TODO follow ups
  constructor(client: DiscordClient, data: IInteraction) {
    this.#type = interactionMap[data.type.toString()];
    this.#client = client;
    this.#raw = data;
  }

  get type(): InteractionType {
    return this.#type;
  }

  get client(): DiscordClient {
    return this.#client;
  }

  get raw(): IInteraction {
    return this.#raw;
  }

  async #runResponse(type: number, data: any): Promise<any> {
    return await doFetch(
      `/interactions/${this.#raw.id}/${this.#raw.token}/callback`,
      {
        auth: true,
        client: this.client,
        body: {
          type,
          data,
        },
        method: HttpMethods.POST,
      }
    );
  }

  async acknowledge(): Promise<void> {
    let type = 4; // acknowledge without reply
    if (this.type === InteractionType.COMPONENTS) type = 6; // will update component message later
    return await this.#runResponse(type, {});
  }

  async respond(
    message: MessageBuilder,
    hiddenForOthers: boolean = false
  ): Promise<void> {
    return await this.#runResponse(4, {
      ...message.raw,
      flags: hiddenForOthers ? 64 : 0, // TODO make bitfields
    });
  }

  async sendLoading(hiddenForOthers: boolean = false): Promise<void> {
    return await this.#runResponse(5, {
      flags: hiddenForOthers ? 64 : 0, // TODO make bitfields
    });
  }

  async updateMessage(message: MessageBuilder): Promise<void> {
    if (this.type !== InteractionType.COMPONENTS)
      throw new Error("Can only be ran on components");
    return await this.#runResponse(4, message.raw);
  }
}

export class InteractionContext {
  #interact: InteractionResponse;
  #client: DiscordClient;

  constructor(client: DiscordClient, data: IInteraction) {
    this.#interact = new InteractionResponse(client, data);
    this.#client = client;
  }

  get client(): DiscordClient {
    return this.#client;
  }

  get interaction(): InteractionResponse {
    return this.#interact;
  }
}
