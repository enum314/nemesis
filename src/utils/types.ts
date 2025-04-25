import {
  type ChatInputCommandInteraction,
  type Client,
  type ClientEvents,
} from "discord.js";

import { Command } from "#classes/command";

export type InhibitorFunction = (
  interaction: ChatInputCommandInteraction<"cached">,
  command: Command
) => boolean | Promise<boolean>;

export type ClientEventListener<ClientEvent extends keyof ClientEvents> = (
  client: Client,
  ...args: ClientEvents[ClientEvent]
) => void | Promise<void>;
