import { DiscordClient } from "../Client";

export enum InteractionType {
  COMPONENTS = "components",
  SLASHCOMMANDS = "slashcommands",
}

class InteractionResponse {
  #type: InteractionType;

  // TODO actually do stuff
  // TODO follow ups
  constructor(type: InteractionType) {
    this.#type = type;
  }

  get type(): InteractionType {
    return this.#type;
  }

  async ackknowledge(): Promise<void> {
    console.log("acknowledged interaction");
  }

  async respond(): Promise<void> {
    console.log("responding to interaction");
  }

  async sendLoading(): Promise<void> {
    console.log("responding to interaction later");
  }

  async updateMessage(): Promise<void> {
    if (this.type !== InteractionType.COMPONENTS)
      throw new Error("Can only be ran on components");
    console.log("updating component message");
  }

  async deferUpdateMessage(): Promise<void> {
    if (this.type !== InteractionType.COMPONENTS)
      throw new Error("Can only be ran on components");
    console.log("updating component message later");
  }
}

export class InteractionContext {
  #interact: InteractionResponse;
  #client: DiscordClient;

  constructor(client: DiscordClient) {
    this.#interact = new InteractionResponse(InteractionType.COMPONENTS);
    this.#client = client;
  }

  get client(): DiscordClient {
    return this.#client;
  }

  get interaction(): InteractionResponse {
    return this.#interact;
  }
}
