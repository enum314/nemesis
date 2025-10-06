import { type Client, type ClientEvents } from "discord.js";

export type ClientEventListener<ClientEvent extends keyof ClientEvents> = (
  client: Client,
  ...args: ClientEvents[ClientEvent]
) => void | Promise<void>;
