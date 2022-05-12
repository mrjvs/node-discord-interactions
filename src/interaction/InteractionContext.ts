import { DiscordClient } from "../Client";
import { MessageActionRowBuilder } from "../message/components/MessageActionRowBuilder";
import { MessageComponent } from "../message/components/MessageComponent";
import { MessageBuilder } from "../message/MessageBuilder";
import { doFetch, HttpMethods } from "../Request";
import { InteractionHandler } from "./InteractionCollection";

export enum InteractionType {
  COMPONENTS = "components",
  SLASHCOMMANDS = "slashcommands",
  PING = "ping",
  MODAL_SUBMIT = "modalsubmit",
}

const interactionMap: any = {
  "1": "ping",
  "2": "slashcommands",
  "3": "components",
  "5": "modalsubmit",
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

  async respondMessage(
    message: MessageBuilder,
    hiddenForOthers: boolean = false
  ): Promise<void> {
    return await this.#runResponse(4, {
      ...message.raw,
      flags: hiddenForOthers ? 64 : 0, // TODO make bitfields
    });
  }

  async respondModal(
    title: string,
    components: MessageComponent[],
    handler: InteractionHandler
  ): Promise<void> {
    if (components.length > 5 || components.length == 0)
      throw new Error(`modals must have at least 1 and max 5 components`);
    return await this.#runResponse(9, {
      title,
      components: components.map((v) => {
        return new MessageActionRowBuilder().addComponent(v).raw;
      }),
      custom_id: handler.id,
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
