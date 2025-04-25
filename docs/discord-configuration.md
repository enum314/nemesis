# Configuration System

This document explains how to use the configuration system for Discord bots in the Nemesis template.

## ⚙️ Overview

The Nemesis template includes a powerful configuration system that uses Zod for schema validation and supports both JSON and YAML formats. All configuration files are stored in the `configs` directory.

### Features

- **Type Safety**: Configuration is fully typed with TypeScript and validated with Zod schemas
- **Default Values**: Each configuration file has default values that are used if no file exists
- **Auto-Creation**: Configuration files are automatically created if they don't exist
- **Format Options**: Support for both JSON and YAML configuration formats
- **Partial Updates**: Ability to update only specific parts of a configuration
- **Addon Support**: Ability to organize configurations by addon

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

## Addon-Specific Configurations

For configurations that are specific to an addon, you can specify the addon name to organize them in a subdirectory:

```typescript
// src/addons/music-player/configs/music.ts
import { z } from "zod";

import { Configuration } from "../../../lib/configuration.js";

const musicConfigSchema = z.object({
  maxQueueSize: z.number().int().positive(),
  defaultVolume: z.number().min(0).max(100),
  allowedChannels: z.array(z.string()).default([]),
});

type MusicConfig = z.infer<typeof musicConfigSchema>;

export const musicConfig = new Configuration<MusicConfig>({
  name: "music",
  type: "json",
  schema: musicConfigSchema,
  defaults: {
    maxQueueSize: 100,
    defaultVolume: 50,
    allowedChannels: [],
  },
  addon: "music-player", // This will store the config in configs/music-player/music.json
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
  // Get the configuration directly
  const config = await botConfig.get();

  // Or access it through the client's configurations collection
  const configFromClient = await interaction.client.configurations
    .get("bot-settings")
    .get();

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

## Configurations Collection

All configurations are automatically loaded and stored in the client's `configurations` collection:

```typescript
// Access a configuration by name
const botSettings = client.configurations.get("bot-settings");
const musicConfig = client.configurations.get("music");

// Get all loaded configurations
const allConfigs = Array.from(client.configurations.values());

// Check if a configuration exists
const hasConfig = client.configurations.has("bot-settings");
```

## Loading Configurations at Startup

Configurations are automatically loaded at bot startup through the initialization process in `index.ts`. You do not need to manually load each configuration.

## Best Practices

1. **Keep Sensitive Data Out**: Don't store tokens or sensitive credentials in configuration files
2. **Use Environment Variables** for sensitive or environment-specific values
3. **Create Multiple Configs** for different aspects of your bot (e.g., commands, logging, etc.)
4. **Add Config Files to .gitignore** if they contain server-specific settings
5. **Use Addon Namespaces** to organize configurations for different addons
