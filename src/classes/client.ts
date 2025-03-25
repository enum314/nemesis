import {
  Collection,
  Client as DiscordClient,
  type ClientEvents,
} from "discord.js";

import { Logger } from "../lib/logger.js";
import { Command } from "./command.js";
import { Dispatcher } from "./dispatcher.js";
import { Event } from "./event.js";

export class Client<
  Ready extends boolean = boolean,
> extends DiscordClient<Ready> {
  public readonly logger: typeof Logger = Logger;

  public readonly commands: Collection<string, Command> = new Collection();

  public readonly events: Collection<string, Event<keyof ClientEvents>> =
    new Collection();

  public readonly dispatcher: Dispatcher = new Dispatcher(
    <DiscordClient<true>>this
  );
}

declare module "discord.js" {
  export interface Client {
    readonly logger: typeof Logger;

    readonly commands: Collection<string, Command>;

    readonly events: Collection<string, Event<keyof ClientEvents>>;

    readonly dispatcher: Dispatcher;
  }
}
