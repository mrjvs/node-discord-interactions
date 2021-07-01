import { DiscordClient } from "../Client";

export type InteractionId = string;
export type InteractionCallback = () => void;
interface InteractionStore {
  id: InteractionId;
  cb: InteractionCallback;
  useOnce: boolean;
}

export class InteractionHandler {
  readonly client: DiscordClient;
  readonly id: InteractionId;

  constructor(client: DiscordClient, id: InteractionId) {
    this.client = client;
    this.id = id;
  }
}

export class InteractionCollection {
  client: DiscordClient;
  handlers: Map<InteractionId, InteractionStore>;

  constructor(client: DiscordClient) {
    this.client = client;
    this.handlers = new Map();
  }

  unregisterHandler(handler: InteractionHandler): boolean {
    if (!this.handlers.has(handler.id)) return false;
    this.handlers.delete(handler.id);
    return true;
  }

  registerId(
    id: InteractionId,
    runner: InteractionCallback
  ): InteractionHandler {
    this.handlers.set(id, {
      id,
      cb: runner,
      useOnce: false,
    });
    return new InteractionHandler(this.client, id);
  }

  register(runner: InteractionCallback): InteractionHandler {
    const id = this.client.utils.generateInteractionId();
    this.handlers.set(id, {
      id,
      cb: runner,
      useOnce: false,
    });
    return new InteractionHandler(this.client, id);
  }

  _registerTemporary(runner: InteractionCallback): InteractionId {
    const id = this.client.utils.generateInteractionId();
    this.handlers.set(id, {
      id,
      cb: runner,
      useOnce: true,
    });
    return id;
  }

  _runInteraction(data: any) {
    if (!data?.data?.custom_id) return;
    const handler = this.handlers.get(data?.data?.custom_id);
    if (!handler) return; // TODO unhandled interaction id, what do?
    try {
      handler?.cb();
    } catch (err) {
      // TODO do something here
    }
    if (handler.useOnce) this.handlers.delete(handler.id);
  }
}
