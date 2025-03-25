import { Client, type ClientEvents } from "discord.js";

import { Logger } from "../lib/logger.js";

export class Event<K extends keyof ClientEvents> {
  constructor(
    public readonly name: K,
    private readonly execute: (
      client: Client<true>,
      ...args: ClientEvents[K]
    ) => Promise<void> | void,
    public readonly once: boolean = false
  ) {}

  public async run(
    client: Client<true>,
    ...args: ClientEvents[K]
  ): Promise<void> {
    try {
      await this.execute(client, ...args);
    } catch (error) {
      Logger.error(`Event - ${this.name}`).error(error);
    }
  }
}
