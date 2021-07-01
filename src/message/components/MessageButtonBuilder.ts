import { MessageButtonType, MessageComponentType } from "./ComponentTypes";
import { MessageComponent } from "./MessageComponent";

export class MessageButtonBuilder extends MessageComponent {
  #style: MessageButtonType;
  #url?: string;
  #label?: string;

  constructor() {
    super(MessageComponentType.BUTTON);
    this.#style = MessageButtonType.PRIMARY;
  }

  // style
  setStyle(style: MessageButtonType): MessageButtonBuilder {
    this.#style = style;
    return this;
  }
  get style(): MessageButtonType {
    return this.#style;
  }

  // url
  setUrl(url: string | undefined): MessageButtonBuilder {
    this.#url = url;
    return this;
  }
  get url(): string | undefined {
    return this.#url;
  }

  // label
  setLabel(text: string | undefined): MessageButtonBuilder {
    this.#label = text;
    return this;
  }
  get label(): string | undefined {
    return this.#label;
  }

  // TODO emoji
  // TODO custom id
  // TODO disabled

  get raw(): any {
    return {
      type: this.t,
      style: this.#style,
      url:
        this.#url && this.#style === MessageButtonType.LINK
          ? this.#url
          : undefined,
      label: this.#label ? this.#label : undefined,
      custom_id: this.#style !== MessageButtonType.LINK ? "test" : undefined,
    };
  }
}
