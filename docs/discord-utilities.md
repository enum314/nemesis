# Utility Functions

This document explains the utility functions available in the Nemesis template for Discord bots.

## 🔧 Overview

The Nemesis template includes a collection of useful utility functions in the `src/utils` directory that help with common tasks in Discord bot development.

## Pagination System

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

## Array Chunking

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

## Deep Merge

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

## Template Rendering with Mustache

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

## File Loading

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

## File System Utilities

The Nemesis template includes a set of file system utilities in `src/lib/fs.ts` that provide a simplified interface for common file operations:

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

## Logging System

The Nemesis template includes a powerful logging system built on Winston that supports sharding information and colorized console output. The logger is accessible throughout the application and attached to the client as `client.logger`.

### Using the Logger Directly

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

```typescript
// In a command
command.run(async (interaction) => {
  interaction.client.logger.info(
    `Command ${command.name} executed by ${interaction.user.tag}`
  );
  // Command implementation...
});
```
