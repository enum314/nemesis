# Discord Bot Integration

This document explains how to use the Nemesis template specifically for Discord bot development.

## 🤖 Discord.js Integration

The Nemesis template includes everything you need to build a production-ready Discord bot:

- **Discord.js integration** with advanced sharding and bot framework
- **Class-based architecture** for commands and events
- **Ready-to-use infrastructure** for scaling your bot
- **Best practices** for bot development and deployment

## 🔧 Discord Bot Configuration

To configure your Discord bot, you'll need to add the following environment variables to your `.env` file:

```
DISCORD_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_guild_id
```

You can obtain these values from the [Discord Developer Portal](https://discord.com/developers/applications).

## 🧱 Project Structure

The Nemesis template uses a modular, class-based approach to organize code:

```
src/
├── classes/          # Core classes for the bot architecture
│   ├── client.ts     # Extended Discord.js client
│   ├── command.ts    # Command class for slash commands
│   ├── dispatcher.ts # Handles command registration and execution
│   └── event.ts      # Event handling system
├── commands/         # Slash command implementations
├── events/           # Discord.js event handlers
├── inhibitors/       # Command restrictions/middleware
├── lib/              # Core libraries and utilities
├── utils/            # Helper functions
├── configs/          # Configuration files
├── index.ts          # Bot initialization without sharding
├── sharding.ts       # Sharding manager implementation
└── main.ts           # Application entry point
```

## 🤖 Discord Bot Sharding

This template includes support for Discord.js sharding, which helps distribute your bot's load across multiple processes when it grows to serve more guilds.

### What is Sharding?

Discord requires sharding for bots in 2,500+ guilds. Sharding splits your bot into multiple processes, each handling a portion of the guilds, which:

- Reduces memory usage and CPU load per process
- Improves performance by distributing workload
- Is required by Discord for larger bots

### Using Sharding

Sharding is managed through the `main.ts` file which reads environment variables to determine whether to enable sharding:

**Environment Variables**:

- `ENABLE_SHARDING`: Set to "true" to enable sharding
- `TOTAL_SHARDS`: Number of shards to spawn, or "auto" to let Discord.js decide

You can enable sharding by setting these environment variables before starting your bot:

```bash
# Enable sharding with environment variables
ENABLE_SHARDING=true node .

# Or with a specific number of shards
ENABLE_SHARDING=true TOTAL_SHARDS=2 node .
```

The sharding implementation is handled in `src/sharding.ts` and automatically manages shard creation, monitoring, and error handling.

## 🤖 Extended Discord Client

The Nemesis template extends the Discord.js Client class to provide additional functionality and easier access to important components. This extended client is defined in `src/classes/client.ts`:

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

### Key Features

The extended Client class provides several important features:

1. **Integrated Logger**: Direct access to the logging system via `client.logger`
2. **Command Storage**: A collection for storing and accessing slash commands
3. **Event Storage**: A collection for storing and accessing event handlers
4. **Command Dispatcher**: An instance of the Dispatcher class for handling command registrations and interactions

### Type Extensions

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

### Using the Extended Client

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

## 📡 Creating Commands

The template uses a class-based approach for defining slash commands. Each command is exported as a Command instance:

```typescript
// src/commands/ping.ts
import { SlashCommandBuilder } from "discord.js";

import { Command } from "../classes/command.js";

const command = new Command(
  new SlashCommandBuilder().setName("ping").setDescription("Replies with pong!")
);

command.run(async (interaction) => {
  // Command implementation goes here
});

export default command;
```

Commands are automatically loaded from the `src/commands` directory when the bot starts.

## 🔄 Events Handling

Discord.js events are handled through the Event class and organized in the `src/events` directory:

```typescript
// src/events/messageCreate.ts
import { Event } from "../classes/event.js";

const event = new Event("messageCreate", (client, message) => {
  // Event handler implementation
});

export default event;
```

Events are automatically loaded from the `src/events` directory when the bot starts.

## 🔌 Command Handling Pipeline

The bot implements a robust command handling pipeline:

1. The `Dispatcher` class registers slash commands with Discord API
2. When commands are invoked, they go through inhibitors (middleware)
3. If all inhibitors pass, the command's runner function is executed
4. Autocomplete interactions are also handled through the same pipeline

## 🛑 Command Inhibitors

Inhibitors act as middleware for command execution, allowing you to implement permission checks, cooldowns, or other restrictions before a command runs. They're defined as functions that return a boolean or Promise<boolean> value:

```typescript
// The InhibitorFunction type
export type InhibitorFunction = (
  interaction: ChatInputCommandInteraction<"cached">,
  command: Command
) => boolean | Promise<boolean>;
```

### How Inhibitors Work

1. Each inhibitor receives the interaction and command being executed
2. If an inhibitor returns `false`, the command is blocked from execution
3. If all inhibitors return `true`, the command proceeds to execute

### Creating an Inhibitor

You can create and register inhibitors in the `src/inhibitors/index.ts` file:

```typescript
// src/inhibitors/index.ts
import type { InhibitorFunction } from "../utils/types.js";

// Create a cooldown inhibitor
const cooldownInhibitor: InhibitorFunction = (interaction, command) => {
  // Your cooldown logic here
  // Return false to prevent execution, true to allow
  return true;
};

// Create a permissions inhibitor
const permissionInhibitor: InhibitorFunction = (interaction, command) => {
  // Check if user has required permissions
  // Return false to prevent execution, true to allow
  return true;
};

// Export all inhibitors
export const inhibitors: InhibitorFunction[] = [
  cooldownInhibitor,
  permissionInhibitor,
];
```

### Common Inhibitor Use Cases

- **Permission Checks**: Block commands based on user roles or permissions
- **Cooldowns**: Prevent command spam by adding rate limits
- **Guild-Only Commands**: Ensure commands only run in specific contexts
- **Maintenance Mode**: Disable commands during bot maintenance
- **User Blacklisting**: Block specific users from using commands

When a command is blocked by an inhibitor, you can provide custom feedback to the user by sending a response within the inhibitor function.

## ⚙️ Configuration System

The Nemesis template includes a powerful configuration system that uses Zod for schema validation and supports both JSON and YAML formats. All configuration files are stored in the `src/configs` directory.

### Features

- **Type Safety**: Configuration is fully typed with TypeScript and validated with Zod schemas
- **Default Values**: Each configuration file has default values that are used if no file exists
- **Auto-Creation**: Configuration files are automatically created if they don't exist
- **Format Options**: Support for both JSON and YAML configuration formats
- **Partial Updates**: Ability to update only specific parts of a configuration

### Creating a Configuration

Here's how to create and use a configuration file in your Discord bot:

```typescript
// src/configs/bot-settings.ts
import { z } from "zod";

import { Configuration } from "../lib/configuration.js";

// Define your configuration schema using Zod
const botConfigSchema = z.object({
  prefix: z.string().default("!"),
  embedColor: z.string().default("#5865F2"),
  deleteCommands: z.boolean().default(false),
  cooldowns: z.object({
    enabled: z.boolean().default(true),
    defaultCooldown: z.number().int().positive().default(3),
  }),
  moderation: z.object({
    logChannel: z.string().optional(),
    adminRoles: z.array(z.string()).default([]),
  }),
});

// Define the type from your schema
type BotConfig = z.infer<typeof botConfigSchema>;

// Create default configuration values
const defaultConfig: BotConfig = {
  prefix: "!",
  embedColor: "#5865F2",
  deleteCommands: false,
  cooldowns: {
    enabled: true,
    defaultCooldown: 3,
  },
  moderation: {
    adminRoles: [],
  },
};

// Initialize your configuration
export const botConfig = new Configuration<BotConfig>({
  name: "bot-settings", // Will create "configs/bot-settings.json" or "configs/bot-settings.yml"
  type: "json", // Use "json" or "yaml"
  schema: botConfigSchema,
  defaults: defaultConfig,
});
```

### Using Configuration in Your Bot

Once you've created a configuration file, you can use it throughout your bot:

```typescript
// src/commands/moderation/ban.ts
import { SlashCommandBuilder } from "discord.js";

import { Command } from "../../classes/command.js";
import { botConfig } from "../../configs/bot-settings.js";

const command = new Command(
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server")
  // ... additional command options
);

command.run(async (interaction) => {
  // Get the configuration
  const config = await botConfig.get();

  // Use values from config
  const embedColor = config.embedColor;
  const adminRoles = config.moderation.adminRoles;

  // Command implementation using config values
  // ...
});

export default command;
```

### Updating Configuration

You can update configuration values at runtime:

```typescript
import { botConfig } from "../../configs/bot-settings.js";

async function updateLogChannel(channelId: string) {
  const result = await botConfig.update({
    moderation: {
      logChannel: channelId,
    },
  });

  if (result.error) {
    console.error("Failed to update config:", result.error);
    return false;
  }

  return true;
}
```

### Loading Configurations at Startup

To ensure configurations are loaded at bot startup, you can add this to your initialization code:

```typescript
// src/index.ts or another initialization file
import { botConfig } from "./configs/bot-settings.js";

async function initializeBot() {
  // Load all configurations
  await botConfig.load();

  // Continue with bot initialization
  // ...
}
```

### Best Practices

1. **Keep Sensitive Data Out**: Don't store tokens or sensitive credentials in configuration files
2. **Use Environment Variables** for sensitive or environment-specific values
3. **Create Multiple Configs** for different aspects of your bot (e.g., commands, logging, etc.)
4. **Add Config Files to .gitignore** if they contain server-specific settings

## 💾 Database Integration

The Nemesis template includes a Prisma-based database setup for your Discord bot. The database client is initialized in `src/lib/db.ts` and exposed as a singleton instance:

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
```

### Using the Database

You can import and use the database client in any part of your application:

```typescript
// Example usage in a command
import { SlashCommandBuilder } from "discord.js";

import { Command } from "../classes/command.js";
import { db } from "../lib/db.js";

const command = new Command(
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your user profile")
);

command.run(async (interaction) => {
  // Get or create a user profile
  const userProfile = await db.userProfile.upsert({
    where: { userId: interaction.user.id },
    update: {}, // No updates if exists
    create: {
      userId: interaction.user.id,
      createdAt: new Date(),
      // Other default values
    },
  });

  await interaction.reply({
    content: `Profile found! Created: ${userProfile.createdAt.toLocaleDateString()}`,
    ephemeral: true,
  });
});
```

### Prisma Schema

To define your database schema, you'll need to create or modify the `prisma/schema.prisma` file. Here's an example schema for a Discord bot:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql" // or "sqlite", "mysql", etc.
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model UserProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  createdAt DateTime @default(now())
  level     Int      @default(1)
  xp        Int      @default(0)

  @@map("user_profiles")
}

model GuildSettings {
  id            String   @id @default(cuid())
  guildId       String   @unique
  prefix        String?
  welcomeChannel String?
  modLogChannel  String?

  @@map("guild_settings")
}
```

### Database Environment Setup

Add your database connection URL to the `.env` file:

```
DATABASE_URL="mysql://nemesis:nemesis@localhost:3306/nemesis"
```

## 📂 File System Utilities

The Nemesis template includes a set of file system utilities in `src/lib/fs.ts` that provide a simplified interface for common file operations. These utilities are used throughout the application for loading commands, managing configuration files, and more.

```typescript
// Example imports from fs.ts
import { existsFile, mkdir, readFile, writeFile } from "../lib/fs.js";
```

### Available Functions

| Function                             | Description                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `makePath(paths: string[])`          | Creates an absolute path using the current working directory and the provided path segments |
| `writeFile(paths: string[], buffer)` | Writes data to a file at the specified path                                                 |
| `readFile(paths: string[])`          | Reads data from a file at the specified path                                                |
| `existsFile(paths: string[])`        | Checks if a file exists at the specified path                                               |
| `stat(paths: string[])`              | Gets file stats for the path                                                                |
| `readdir(paths: string[])`           | Lists the contents of a directory                                                           |
| `mkdir(paths: string[])`             | Creates a directory at the specified path (recursive)                                       |
| `existsDirectory(paths: string[])`   | Checks if a directory exists at the specified path                                          |

### Using File System Utilities

These utilities make it easy to work with files in a consistent way throughout your application:

```typescript
// Example of reading and writing a file
import { existsFile, readFile, writeFile } from "../lib/fs.js";

async function saveUserData(userId: string, data: any) {
  const filePath = ["data", "users", `${userId}.json`];

  await writeFile(filePath, JSON.stringify(data, null, 2));
}

async function loadUserData(userId: string) {
  const filePath = ["data", "users", `${userId}.json`];

  if (await existsFile(filePath)) {
    const fileData = await readFile(filePath);
    return JSON.parse(fileData.toString());
  }

  return null;
}
```

## 📊 Logging System

The Nemesis template includes a powerful logging system built on Winston that supports sharding information and colorized console output. The logger is accessible throughout the application and attached to the client as `client.logger`.

### Features

- **Shard-Aware Logging**: Automatically detects and includes shard IDs in log messages
- **Timestamp Formatting**: Includes formatted timestamps with each log
- **Error Stack Traces**: Automatically formats and includes stack traces for error objects
- **Colorized Output**: Uses color to distinguish between log levels in the console

### Using the Logger Directly

You can import and use the logger directly from `src/lib/logger.ts`:

```typescript
import { Logger } from "../lib/logger.js";

// Different log levels
Logger.info("This is an info message");
Logger.warn("This is a warning message");
Logger.error("This is an error message");
Logger.debug("This is a debug message");

// Logging errors with stack traces
try {
  // Some code that might throw
  throw new Error("Something went wrong");
} catch (error) {
  Logger.error("Failed to execute operation:", error);
}
```

### Using the Logger via Client

The logger is also attached to the Discord client for convenient access in commands and events:

```typescript
// In a command
command.run(async (interaction) => {
  interaction.client.logger.info(
    `Command ${command.name} executed by ${interaction.user.tag}`
  );
  // Command implementation...
});

// In an event
const event = new Event("guildCreate", (client, guild) => {
  client.logger.info(`Bot joined a new guild: ${guild.name} (${guild.id})`);
});
```

### Sharding-Related Functions

The logger module exports functions related to shard detection:

- `setDiscordClient(client)`: Sets the Discord client for automatic shard detection
- `setAsShardManager()`: Marks the current process as the shard manager
- `setCurrentShardId(shardId)`: Manually sets the current shard ID

These functions are used internally by the bot framework and typically don't need to be called directly in your code.

## 🔧 Utility Functions

The Nemesis template includes a collection of useful utility functions in the `src/utils` directory that help with common tasks in Discord bot development.

### Pagination System

The `paginate.ts` utility provides an easy-to-use pagination system for Discord embeds, perfect for commands that need to display large amounts of data:

```typescript
import { EmbedBuilder } from "discord.js";

import { paginate } from "../utils/paginate.js";

command.run(async (interaction) => {
  // Create multiple embeds for pagination
  const embeds = [
    new EmbedBuilder().setTitle("Page 1").setDescription("Content for page 1"),
    new EmbedBuilder().setTitle("Page 2").setDescription("Content for page 2"),
    new EmbedBuilder().setTitle("Page 3").setDescription("Content for page 3"),
  ];

  // Display paginated embeds with navigation buttons
  await paginate(interaction, embeds, { rows: [] });
});
```

The pagination system automatically adds navigation buttons and handles user interactions, making it easy to create multi-page responses.

### Array Chunking

The `chunk.ts` utility splits arrays into smaller chunks, which is useful for processing large datasets or creating paginated content:

```typescript
import { chunk } from "../utils/chunk.js";

// Split an array into chunks of 10 items each
const users = ["user1", "user2", "user3" /* ... more users */];
const userChunks = chunk(users, 10);

// Now you can process each chunk separately
userChunks.forEach((userChunk, index) => {
  console.log(`Processing chunk ${index + 1}`);
  // Process the chunk
});
```

### Deep Merge

The `merge.ts` utility provides a deep merge function for combining objects, which is especially useful when working with configuration objects:

```typescript
import { merge } from "../utils/merge.js";

// Default settings
const defaultSettings = {
  prefix: "!",
  features: {
    welcome: true,
    logging: {
      enabled: true,
      level: "info",
    },
  },
};

// User settings (partial)
const userSettings = {
  features: {
    logging: {
      level: "debug",
    },
  },
};

// Merge the objects (deep merge)
const mergedSettings = merge(defaultSettings, userSettings);

// Result maintains the structure while overriding specific values
// {
//   prefix: "!",
//   features: {
//     welcome: true,
//     logging: {
//       enabled: true,
//       level: "debug"  // This value was overridden
//     }
//   }
// }
```

### Template Rendering with Mustache

The `mustache.ts` utility provides a simple template rendering system using Mustache templates:

```typescript
import { mustache } from "../utils/mustache.js";

// Render a template with data
const template = "Hello, {{name}}! You have {{count}} new messages.";
const rendered = mustache(template, {
  name: "User",
  count: 5,
});

// Result: "Hello, User! You have 5 new messages."
```

This is particularly useful for creating dynamic messages or formatting text with variable content.

### File Loading

The `loadFiles.ts` utility provides a function to recursively load all files from a directory, which is used internally by the bot framework to load commands and events:

```typescript
import { getAllFiles } from "../utils/loadFiles.js";

// Get all files from a directory recursively
const commandFiles = getAllFiles("commands");

// Process each file
for (const file of commandFiles) {
  // Do something with each file
  console.log(`Loading file: ${file}`);
}
```

This utility makes it easy to implement dynamic loading of modules and extensions.

### Type Definitions

The `types.ts` file contains TypeScript type definitions used throughout the application, including:

- `InhibitorFunction`: Type for command inhibitors
- `ClientEventListener`: Type for event listeners

These type definitions ensure type safety and consistency throughout the codebase.

## 🛠️ Additional Resources

- [Discord.js Documentation](https://discord.js.org/#/docs)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [Discord.js Guide](https://discordjs.guide/)
