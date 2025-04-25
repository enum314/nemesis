# Extended Discord Client

This document explains the extended Discord.js Client class in the Nemesis template.

## 🤖 Overview

The Nemesis template extends the Discord.js Client class to provide additional functionality and easier access to important components. This extended client is defined in `src/classes/client.ts`.

```typescript
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
```

## Key Features

The extended Client class provides several important features:

1. **Integrated Logger**: Direct access to the logging system via `client.logger`
2. **Command Storage**: A collection for storing and accessing slash commands
3. **Event Storage**: A collection for storing and accessing event handlers
4. **Command Dispatcher**: An instance of the Dispatcher class for handling command registrations and interactions

## Type Extensions

The Client class also extends Discord.js typings to ensure TypeScript recognizes the additional properties:

```typescript
declare module "discord.js" {
  export interface Client {
    readonly logger: typeof Logger;
    readonly commands: Collection<string, Command>;
    readonly events: Collection<string, Event<keyof ClientEvents>>;
    readonly dispatcher: Dispatcher;
  }
}
```

## Using the Extended Client

The extended client is available in command and event handlers:

```typescript
// In a command
command.run(async (interaction) => {
  // Access the logger
  interaction.client.logger.info("Command executed");

  // Access other commands
  const otherCommand = interaction.client.commands.get("other-command");

  // Access the dispatcher
  await interaction.client.dispatcher.initialize();
});

// In an event
const event = new Event("ready", (client) => {
  // Access the logger
  client.logger.info(`Logged in as ${client.user?.tag}`);

  // Access registered commands
  client.logger.info(`Loaded ${client.commands.size} commands`);
});
```

The extended client provides a central access point for all major parts of your bot's functionality, making it easier to build complex features that interact with multiple systems.
