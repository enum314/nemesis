import type { ClientEvents } from "discord.js";

import { Command } from "#classes/command";
import { Event } from "#classes/event";
import { Configuration } from "#lib/configuration";

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
