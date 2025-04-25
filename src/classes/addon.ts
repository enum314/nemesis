import type { ClientEvents } from "discord.js";

import { Configuration } from "../lib/configuration.js";
import { Command } from "./command.js";
import { Event } from "./event.js";

export interface AddonOptions {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
}

export class Addon {
  public constructor(
    public readonly options: AddonOptions,
    public loader: () => Promise<{
      commands: Command[];
      events: Event<keyof ClientEvents>[];
      configurations: Configuration<any>[];
    }>
  ) {}
}
