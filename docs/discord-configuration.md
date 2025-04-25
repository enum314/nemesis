# Configuration System

This document explains how to use the configuration system for Discord bots in the Nemesis template.

## ⚙️ Overview

The Nemesis template includes a powerful configuration system that uses Zod for schema validation and supports both JSON and YAML formats. All configuration files are stored in the `src/configs` directory.

### Features

- **Type Safety**: Configuration is fully typed with TypeScript and validated with Zod schemas
- **Default Values**: Each configuration file has default values that are used if no file exists
- **Auto-Creation**: Configuration files are automatically created if they don't exist
- **Format Options**: Support for both JSON and YAML configuration formats
- **Partial Updates**: Ability to update only specific parts of a configuration

## Creating a Configuration

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

## Using Configuration in Your Bot

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

## Updating Configuration

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

## Loading Configurations at Startup

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

## Best Practices

1. **Keep Sensitive Data Out**: Don't store tokens or sensitive credentials in configuration files
2. **Use Environment Variables** for sensitive or environment-specific values
3. **Create Multiple Configs** for different aspects of your bot (e.g., commands, logging, etc.)
4. **Add Config Files to .gitignore** if they contain server-specific settings
