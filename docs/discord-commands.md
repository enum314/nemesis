# Creating Discord Commands

This document explains how to create and manage Discord slash commands in the Nemesis template.

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

You can create and register inhibitors in the `src/functions/inhibitors.ts` file:

```typescript
// src/functions/inhibitors.ts
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
