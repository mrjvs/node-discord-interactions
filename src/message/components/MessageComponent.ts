import { MessageComponentType } from "./ComponentTypes";

export class MessageComponent {
  protected t: MessageComponentType;
  constructor(type: MessageComponentType) {
    this.t = type;
  }

  get type(): MessageComponentType {
    return this.t;
  }

  get raw(): any {
    throw new Error("Cannot get raw from invalid component");
  }
}
