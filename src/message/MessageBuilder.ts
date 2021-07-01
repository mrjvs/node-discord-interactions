import { MessageActionRowBuilder } from "./components/MessageActionRowBuilder";
import { EmbedBuilder } from "./EmbedBuilder";

export class MessageBuilder {
  #content: string;
  #embeds: EmbedBuilder[];
  #components: MessageActionRowBuilder[];
  static maxComponents: number = 5;

  constructor() {
    this.#content = "";
    this.#embeds = [];
    this.#components = [];
  }

  // content
  setContent(text: string): MessageBuilder {
    this.#content = text;
    return this;
  }
  get content(): string {
    return this.#content;
  }

  // embeds
  addEmbed(embed: EmbedBuilder): MessageBuilder {
    this.#embeds.push(embed);
    return this;
  }

  // components
  addComponent(component: MessageActionRowBuilder): MessageBuilder {
    if (this.#components.length > MessageBuilder.maxComponents)
      throw new Error(
        `messages cannot have more than ${MessageBuilder.maxComponents} components`
      );
    this.#components.push(component);
    return this;
  }

  get raw(): any {
    return {
      content: this.#content,
      embeds:
        this.#embeds.length > 0 ? this.#embeds.map((v) => v.raw) : undefined,
      components:
        this.#components.length > 0
          ? this.#components.map((v) => v.raw)
          : undefined,
    };
  }
}
