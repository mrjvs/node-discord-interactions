import { MessageComponentType } from "./ComponentTypes";
import { MessageComponent } from "./MessageComponent";

export interface SelectMenuOption {
  label: string;
  value: string;
  description?: string;
  emoji?: any;
  default?: boolean;
}

export class MessageSelectMenuBuilder extends MessageComponent {
  #options: SelectMenuOption[];
  #minVal: number;
  #maxVal: number;
  #placeholder?: string;
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

  // TODO custom_id

  get raw(): any {
    return {
      type: this.t,
      options: this.#options,
      min_values: this.#minVal,
      max_values: this.#maxVal,
      placeholder:
        this.#placeholder && this.#placeholder.length > 0
          ? this.#placeholder
          : undefined,
      custom_id: "Hello world",
    };
  }
}
