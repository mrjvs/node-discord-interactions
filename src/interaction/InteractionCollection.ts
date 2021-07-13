import { DiscordClient } from "../Client";
import { LogType } from "../Logger";
import { sign as signTools } from "tweetnacl";
import { InteractionContext } from "./InteractionContext";

export type InteractionId = string;
export type InteractionCallback = (ctx: InteractionContext) => void;
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
    if (!handler) {
      this.client.logger.logItem({
        type: LogType.WARN,
        message: `Unhandled interaction with custom_id of ${data?.data?.custom_id}`,
      });
      return;
    }
    try {
      handler?.cb(new InteractionContext(this.client, data));
    } catch (err) {
      this.client.logger.logItem({
        type: LogType.WARN,
        message: `Exception occured at interaction handler for id: ${data?.data?.custom_id}`,
        exception: err,
      });
    }
    if (handler.useOnce) this.handlers.delete(handler.id);
  }

  // run this middleware before body gets parsed
  getExpressMiddleware() {
    return (req: any, _: any, next: any) => {
      req.discordRawBody = new Promise((resolve) => {
        let buf = "";
        req.on("data", (x: any) => (buf += x));
        req.on("end", () => {
          resolve(buf);
        });
      });
      next();
    };
  }

  // requires the middleware and the body to be parsed into req.body
  getExpressRouter() {
    return async (req: any, res: any) => {
      // validate security headers
      if (!req.discordRawBody) {
        this.client.logger.logItem({
          type: LogType.WARN,
          message: "Middleware missing on webhook router",
        });
        return res.status(500).json({ message: "Middleware misconfigured" });
      }
      if (!this.client.options.publicKey) {
        this.client.logger.logItem({
          type: LogType.WARN,
          message: "Public key missing on configuration, needed for webhook",
        });
        return res.status(500).json({ message: "Public key misconfigured" });
      }
      const raw = await req.discordRawBody;
      const sign = req.header("X-Signature-Ed25519");
      const time = req.header("X-Signature-Timestamp");
      if (!raw || !sign || !time)
        return res.status(401).json({ message: "missing signature headers" });
      const verified = signTools.detached.verify(
        Buffer.from(time + raw),
        Buffer.from(sign, "hex"),
        Buffer.from(this.client.options.publicKey, "hex")
      );
      if (!verified)
        res.status(401).json({ message: "Failed to validate signature" });

      // acknowledge ping
      if (req?.body?.type == 1) {
        res.status(200).json({
          type: 1,
        });
      }

      // handle interaction
      if (req?.body) this._runInteraction(req.body);
    };
  }
}
