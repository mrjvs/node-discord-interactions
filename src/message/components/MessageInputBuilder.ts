import { DiscordClient } from "../../Client";
import { MessageComponentType, MessageInputType } from "./ComponentTypes";
import { MessageComponent } from "./MessageComponent";

class MessageInputBuilder extends MessageComponent {
  #style: MessageInputType;
  #label?: string;
  #id?: string;
  #min_length?: number;
  #max_length?: number;
  #required: boolean;
  #value?: string;
  #placeholder?: string;

  constructor() {
    super(MessageComponentType.INPUT);
    this.#required = false;
    this.#style = MessageInputType.SHORT;
  }

  // style
  setStyle(style: MessageInputType): MessageInputBuilder {
    this.#style = style;
    return this;
  }
  get style(): MessageInputType {
    return this.#style;
  }

  // label
  setLabel(label: string): MessageInputBuilder {
    this.#label = label;
    return this;
  }
  get label(): string | undefined {
    return this.#label;
  }

  // required
  setRequired(required: boolean): MessageInputBuilder {
    this.#required = required;
    return this;
  }
  get required(): boolean {
    return this.#required;
  }

  // placeholder
  setPlaceholder(placeholder: string | undefined): MessageInputBuilder {
    this.#placeholder = placeholder;
    return this;
  }
  get placeholder(): string | undefined {
    return this.#placeholder;
  }

  // value
  setValue(value: string | undefined): MessageInputBuilder {
    this.#value = value;
    return this;
  }
  get value(): string | undefined {
    return this.#value;
  }

  // id
  setId(id: string): MessageInputBuilder {
    this.#id = id;
    return this;
  }
  get id(): string | undefined {
    return this.#id;
  }

  // min & max length
  setMinLength(min: number | undefined): MessageInputBuilder {
    this.#min_length = min;
    return this;
  }
  setMaxLength(max: number | undefined): MessageInputBuilder {
    this.#max_length = max;
    return this;
  }
  get maxLength(): number | undefined {
    return this.#max_length;
  }
  get minLength(): number | undefined {
    return this.#min_length;
  }

  // TODO check min max of values
  get raw(): any {
    return {
      type: this.t,
      style: this.#style,
      label: this.#label,
      placeholder: this.#placeholder,
      min_length: this.#min_length,
      max_length: this.#max_length,
      required: this.#required,
      value: this.#value,
      custom_id: this.#id,
    };
  }
}

export interface InputType {
  style: MessageInputType;
  required?: boolean;
  label?: string;
  placeholder?: string;
  value?: string;
  min_length?: number;
  max_length?: number;
  id: string;
}

export const Input = {
  create(input: InputType, client: DiscordClient): MessageInputBuilder {
    const b = new MessageInputBuilder();
    b.setStyle(input.style);
    b.setId(input.id);
    if (input.required !== undefined) b.setRequired(input.required);
    if (input.label) b.setLabel(input.label);
    if (input.placeholder) b.setPlaceholder(input.placeholder);
    if (input.value) b.setValue(input.value);
    if (input.min_length !== undefined) b.setMinLength(input.min_length);
    if (input.max_length !== undefined) b.setMaxLength(input.max_length);
    return b;
  },
  builder(): MessageInputBuilder {
    return new MessageInputBuilder();
  },
};
