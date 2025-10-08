import type { ClientEvents } from "discord.js";

import { Command } from "#classes/command";
import { Configuration } from "#classes/configuration";
import { Event } from "#classes/event";

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
