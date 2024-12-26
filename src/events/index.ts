import { ClientEvents } from "discord.js";

import { type ClientEventListener } from "../utils/types";

interface DiscordEvent<ClientEvent extends keyof ClientEvents> {
  eventName: ClientEvent;
  once?: ClientEventListener<ClientEvent>;
  on?: ClientEventListener<ClientEvent>;
}

export const events: DiscordEvent<any>[] = [];
