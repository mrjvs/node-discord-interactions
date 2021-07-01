import { DiscordClient } from "./Client";
import fetch, { Response } from "node-fetch";

export enum HttpMethods {
  GET = "GET",
  POST = "POST",
}

interface FetchResult {
  response: Response;
  data: any;
}

interface BaseFetchOptions {
  body?: Object;
  method?: HttpMethods;
  client: DiscordClient;
}

export interface FetchOptions extends BaseFetchOptions {
  auth?: boolean;
}

export interface FetchOptionsAuth extends BaseFetchOptions {
  auth: true;
}

export class UnauthorizedException extends Error {
  res: Response;
  data: any;

  constructor(response: Response, data: any, reason?: string) {
    super(reason || "401 unauthorized");
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
    this.res = response;
    this.data = data;
  }
}

// TODO ratelimits
export async function doFetch(
  url: string,
  options: FetchOptionsAuth | FetchOptions
): Promise<FetchResult> {
  const body = options.body ? JSON.stringify(options.body) : undefined;
  const method = options.method || HttpMethods.GET;
  const headers: any = {};
  if (options.auth)
    headers.Authorization = `Bot ${options.client.options.token}`;
  const res = await fetch(options.client.options.discordUrl + url, {
    method,
    body,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  const data = await res.json();
  if (res.status === 401) {
    throw new UnauthorizedException(res, data);
  }
  return {
    response: res,
    data,
  };
}
