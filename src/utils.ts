import { v4 as uuid } from "uuid";
import { randomBytes } from "crypto";
import { DiscordClient } from "./Client";

export class Utils {
  client: DiscordClient;

  constructor(client: DiscordClient) {
    this.client = client;
  }

  generateInteractionId(): string {
    return [
      this.client.options.idPrefix,
      uuid(),
      randomBytes(4).toString("hex"),
    ].join("-");
  }
}
