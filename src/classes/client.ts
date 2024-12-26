import { Collection, Client as DiscordClient } from "discord.js";

import { Logger } from "../lib/logger";
import { Command } from "./command";
import { Dispatcher } from "./dispatcher";

export class Client<
  Ready extends boolean = boolean,
> extends DiscordClient<Ready> {
  public readonly logger: typeof Logger = Logger;

  public readonly commands: Collection<string, Command> = new Collection();

  public readonly dispatcher: Dispatcher = new Dispatcher(
    <DiscordClient<true>>this
  );
}

declare module "discord.js" {
  export interface Client {
    readonly logger: typeof Logger;

    readonly commands: Collection<string, Command>;

    readonly dispatcher: Dispatcher;
  }
}
