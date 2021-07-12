import * as chalk from "chalk";
import { DiscordClient } from "./Client";

export enum LogType {
  INFO = "INFO",
  WARN = "WARN",
  FATAL = "FATAL",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

const logConvertMap = {
  INFO: [console.log, "cyanBright"],
  WARN: [console.log, "yellowBright"],
  FATAL: [console.error, "redBright"],
  ERROR: [console.error, "magentaBright"],
  DEBUG: [console.log, "greenBright"],
};

export interface LogItem {
  type: LogType;
  message?: string;
  exception?: Error;
}

export class DiscordLogger {
  client: DiscordClient;

  constructor(client: DiscordClient) {
    this.client = client;
  }

  logItem(item: LogItem) {
    if (!this.client.options.logger?.enabled) return;
    if (item.type == LogType.DEBUG && !this.client.options.logger?.debug)
      return;
    if (this.client.options.logger?.logFunction) {
      this.client.options.logger?.logFunction(item);
      return;
    }
    const logFunc = logConvertMap[item.type][0] as any;
    if (this.client.options.logger?.printType === "json") {
      return logFunc(JSON.stringify(item));
    }
    const colorFunc = (chalk as any)[logConvertMap[item.type][1] as string];
    let out = `[${item.type}]`.padEnd(8, " ");
    if (this.client.options.logger?.printType != "human") out = colorFunc(out);
    if (item.message) out += item.message;
    else if (item.exception) out += "An exception occured";
    logFunc(out);
    if (item.exception) logFunc(item.exception);
  }
}
