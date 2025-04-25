# Discord Bot Addons

This document explains how to create and use addons for your Discord bot in the Nemesis template.

## 🧩 What are Addons?

Addons are modular components that package related functionality into reusable units. They help you organize your bot's features and keep your codebase clean.

## 📦 Creating an Addon

To create an addon, follow these steps:

1. Create a directory in `src/addons/` with your addon name (e.g., `welcomer`)
2. Add an `addon.ts` file that registers the addon
3. Add any events, commands, and configurations to appropriate subdirectories

### Example: Welcomer Addon

#### 1. Register the Addon

First, create the addon.ts file:

```typescript
// src/addons/welcomer/addon.ts
import { registerAddon } from "../../functions/loader.js";

export default registerAddon({
  id: "welcomer",
  name: "Welcomer",
  description: "A simple addon to welcome new members to the server.",
  version: "1.0.0",
  author: "John Doe",
});
```

The `registerAddon` function automatically loads all commands, events, and configurations from your addon's directory.

#### 2. Create Configurations

Add configuration files in the `configs` directory:

```typescript
// src/addons/welcomer/configs/welcome.ts
import { z } from "zod";

import { Configuration } from "../../../lib/configuration.js";

// Define schema for welcome configuration
const welcomeConfigSchema = z
  .object({
    welcomeChannelId: z.string(),
    welcomeMessage: z.string(),
    welcomeColor: z.string(),
  })
  .strict();

// Type for the welcome configuration
type WelcomeConfig = z.infer<typeof welcomeConfigSchema>;

// Create a configuration for welcome channel
const welcomeConfig = new Configuration<WelcomeConfig>({
  name: "welcome",
  type: "yaml",
  schema: welcomeConfigSchema,
  defaults: {
    welcomeChannelId: "",
    welcomeMessage:
      "Welcome {{user}} to the server! We hope you enjoy your stay!",
    welcomeColor: "#00ff00",
  },
  addon: "welcomer", // Stores config in configs/welcomer/welcome.yaml
});

export default welcomeConfig;
```

#### 3. Create Event Handlers

Add event handlers in the `events` directory:

```typescript
// src/addons/welcomer/events/guildMemberAdd.ts
import { EmbedBuilder, userMention } from "discord.js";

import { Event } from "../../../classes/event.js";
import { mustache } from "../../../utils/mustache.js";
import welcomeConfig from "../configs/welcome.js";

const event = new Event("guildMemberAdd", async (_, member) => {
  // Get the configuration
  const config = await welcomeConfig.get();

  // If channel is not set, do nothing
  if (!config.welcomeChannelId) return;

  // Get the channel
  const welcomeChannel = member.guild.channels.cache.get(
    config.welcomeChannelId
  );
  if (!welcomeChannel || !welcomeChannel.isTextBased()) return;

  // Create welcome message with dynamic user mention
  const welcomeMessage = mustache(config.welcomeMessage, {
    user: userMention(member.id),
  });

  // Create and send embed
  const embed = new EmbedBuilder()
    .setColor(config.welcomeColor as `#${string}`)
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setDescription(welcomeMessage)
    .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
    .setTimestamp()
    .setFooter({
      text: `Member #${member.guild.memberCount}`,
      iconURL: member.guild.iconURL() || undefined,
    });

  await welcomeChannel.send({ embeds: [embed] });
});

export default event;
```

### 4. Add Commands (Optional)

You can also add commands to your addon in the `commands` directory.

## 📂 Addon File Structure

A complete addon typically follows this structure:

```
src/addons/your-addon/
├── addon.ts              # Addon registration
├── configs/              # Configuration files
│   └── settings.ts
├── commands/             # Command files
│   └── example.ts
└── events/               # Event handlers
    └── handler.ts
```

## 🔄 How Addons are Loaded

The `registerAddon` function:

1. Registers your addon's metadata with the bot
2. Automatically discovers and loads all your addon's:
   - Commands
   - Events
   - Configurations

## 📋 Best Practices

1. **Keep it focused**: Each addon should have a single, clear purpose
2. **Proper structure**: Use appropriate directories for commands, events, and configs
3. **Configuration**: Make your addon configurable using the configuration system
4. **Documentation**: Include a README.md in your addon directory
