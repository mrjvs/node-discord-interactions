import { MessageComponentType } from "./ComponentTypes";
import { MessageComponent } from "./MessageComponent";

export class MessageActionRowBuilder extends MessageComponent {
  #components: MessageComponent[];

  constructor() {
    super(MessageComponentType.ACTION_ROW);
    this.#components = [];
  }

  get length(): number {
    return this.#components.length;
  }

  // components
  addComponent(component: MessageComponent): MessageActionRowBuilder {
    if (component.type == MessageComponentType.ACTION_ROW)
      throw new Error(
        "Actions rows cannot have another action row nested inside of it"
      );
    if (this.#components.find((v) => v.type !== component.type))
      throw new Error(
        "Actions rows can only contain one type of component at the same time"
      );
    this.#components.push(component);
    return this;
  }
  clearComponents(): MessageActionRowBuilder {
    this.#components = [];
    return this;
  }

  get raw(): any {
    return {
      type: this.t,
      components: this.#components.map((v) => v.raw),
    };
  }
}
