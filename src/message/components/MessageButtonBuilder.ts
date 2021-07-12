import { DiscordClient } from "../../Client";
import {
  InteractionCallback,
  InteractionHandler,
  InteractionId,
} from "../../interaction/InteractionCollection";
import { MessageButtonType, MessageComponentType } from "./ComponentTypes";
import { MessageComponent } from "./MessageComponent";

class MessageButtonBuilder extends MessageComponent {
  #style: MessageButtonType;
  #url?: string;
  #label?: string;
  #interactionId?: InteractionId;

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

  // interactions
  onFirstInteract(
    client: DiscordClient,
    runner: InteractionCallback
  ): MessageButtonBuilder {
    // TODO could leak if never ran or failed to be sent
    this.#interactionId = client.interactions._registerTemporary(runner);
    return this;
  }
  onInteract(handler: InteractionHandler): MessageButtonBuilder {
    this.#interactionId = handler.id;
    return this;
  }
  onInteractId(id: InteractionId): MessageButtonBuilder {
    this.#interactionId = id;
    return this;
  }

  // TODO emoji
  // TODO disabled

  get raw(): any {
    if (this.#style !== MessageButtonType.LINK && !this.#interactionId)
      throw new Error("Cant have a button without a linked interaction");
    if (this.#style === MessageButtonType.LINK && this.#interactionId)
      throw new Error("Cant put interactions on a link button");
    return {
      type: this.t,
      style: this.#style,
      url:
        this.#url && this.#style === MessageButtonType.LINK
          ? this.#url
          : undefined,
      label: this.#label ? this.#label : undefined,
      custom_id: this.#interactionId ? this.#interactionId : undefined,
    };
  }
}

export interface ButtonType {
  style?: MessageButtonType;
  url?: string;
  label?: string;
  onInteract?: InteractionHandler;
  onFirstInteract?: InteractionCallback;
  interactId?: InteractionId;
}

export const Button = {
  create(button: ButtonType, client: DiscordClient): MessageButtonBuilder {
    const b = new MessageButtonBuilder();
    if (button.style) b.setStyle(button.style);
    if (button.url) b.setUrl(button.url);
    if (button.label) b.setLabel(button.label);
    if (button.onFirstInteract)
      b.onFirstInteract(client, button.onFirstInteract);
    else if (button.onInteract) b.onInteract(button.onInteract);
    else if (button.interactId) b.onInteractId(button.interactId);
    return b;
  },
  builder(): MessageButtonBuilder {
    return new MessageButtonBuilder();
  },
};
