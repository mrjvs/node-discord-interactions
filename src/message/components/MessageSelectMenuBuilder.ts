import { DiscordClient } from "../../Client";
import {
  InteractionCallback,
  InteractionHandler,
  InteractionId,
} from "../../interaction/InteractionCollection";
import { MessageComponentType } from "./ComponentTypes";
import { MessageComponent } from "./MessageComponent";

export interface SelectMenuOption {
  label: string;
  value: string;
  description?: string;
  emoji?: any;
  default?: boolean;
}

class MessageSelectMenuBuilder extends MessageComponent {
  #options: SelectMenuOption[];
  #minVal: number;
  #maxVal: number;
  #placeholder?: string;
  #interactionId?: InteractionId;
  static maxOptions: number = 25;

  constructor() {
    super(MessageComponentType.SELECT_MENU);
    this.#options = [];
    this.#minVal = 1;
    this.#maxVal = 1;
  }

  // options
  get length(): number {
    return this.#options.length;
  }
  addOption(option: SelectMenuOption): MessageSelectMenuBuilder {
    if (this.length >= MessageSelectMenuBuilder.maxOptions)
      throw new Error(
        `Select menus cannot have more than ${MessageSelectMenuBuilder.maxOptions} options`
      );
    this.#options.push(option);
    return this;
  }
  clearOptions(): MessageSelectMenuBuilder {
    this.#options = [];
    return this;
  }

  // minmax
  setMaxSelectable(max: number): MessageSelectMenuBuilder {
    if (max < 0) max = 0;
    if (max > MessageSelectMenuBuilder.maxOptions)
      max = MessageSelectMenuBuilder.maxOptions;
    this.#maxVal = max;
    return this;
  }
  setMinSelectable(min: number): MessageSelectMenuBuilder {
    if (min < 0) min = 0;
    if (min > MessageSelectMenuBuilder.maxOptions)
      min = MessageSelectMenuBuilder.maxOptions;
    this.#minVal = min;
    return this;
  }

  // placeholder
  setPlaceholder(placeholder: string | undefined) {
    this.#placeholder = placeholder;
    return this;
  }

  // interactions
  onFirstInteract(
    client: DiscordClient,
    runner: InteractionCallback
  ): MessageSelectMenuBuilder {
    // TODO could leak if never ran or failed to be sent
    this.#interactionId = client.interactions._registerTemporary(runner);
    return this;
  }
  onInteract(handler: InteractionHandler): MessageSelectMenuBuilder {
    this.#interactionId = handler.id;
    return this;
  }
  onInteractId(id: InteractionId): MessageSelectMenuBuilder {
    this.#interactionId = id;
    return this;
  }

  get raw(): any {
    if (!this.#interactionId)
      throw new Error("Cant have a select menu without a linked interaction");
    return {
      type: this.t,
      options: this.#options,
      min_values: this.#minVal,
      max_values: this.#maxVal,
      placeholder:
        this.#placeholder && this.#placeholder.length > 0
          ? this.#placeholder
          : undefined,
      custom_id: this.#interactionId,
    };
  }
}

export interface SelectMenuType {
  placeholder?: string;
  onInteract?: InteractionHandler;
  onFirstInteract?: InteractionCallback;
  interactId?: InteractionId;
  minValue?: number;
  maxValue?: number;
  options: SelectMenuOption[];
}

export const SelectMenu = {
  create(
    menu: SelectMenuType,
    client: DiscordClient
  ): MessageSelectMenuBuilder {
    const b = new MessageSelectMenuBuilder();
    if (menu.placeholder) b.setPlaceholder(menu.placeholder);
    if (menu.minValue) b.setMinSelectable(menu.minValue);
    if (menu.maxValue) b.setMaxSelectable(menu.maxValue);
    menu.options.forEach((v) => b.addOption(v));
    if (menu.onFirstInteract) b.onFirstInteract(client, menu.onFirstInteract);
    else if (menu.onInteract) b.onInteract(menu.onInteract);
    else if (menu.interactId) b.onInteractId(menu.interactId);
    return b;
  },
  builder(): MessageSelectMenuBuilder {
    return new MessageSelectMenuBuilder();
  },
};
