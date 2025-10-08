import {
  Collection,
  Client as DiscordClient,
  type ClientEvents,
} from "discord.js";

import type { Addon } from "#classes/addon";
import type { Command } from "#classes/command";
import type { Configuration } from "#classes/configuration";
import { Dispatcher } from "#classes/dispatcher";
import { Event } from "#classes/event";
import { Logger } from "#lib/logger";

export class Client<
  Ready extends boolean = boolean,
> extends DiscordClient<Ready> {
  public readonly logger: typeof Logger = Logger;

  public readonly addons: Collection<string, Addon> = new Collection();

  public readonly commands: Collection<string, Command> = new Collection();

  public readonly events: Collection<string, Event<keyof ClientEvents>> =
    new Collection();

  public readonly configurations: Collection<string, Configuration<any>> =
    new Collection();

  public readonly dispatcher: Dispatcher = new Dispatcher(
    <DiscordClient<true>>this
  );
}

declare module "discord.js" {
  export interface Client {
    readonly logger: typeof Logger;

    readonly addons: Collection<string, Addon>;

    readonly commands: Collection<string, Command>;

    readonly events: Collection<string, Event<keyof ClientEvents>>;

    readonly configurations: Collection<string, Configuration<any>>;

    readonly dispatcher: Dispatcher;
  }
}
