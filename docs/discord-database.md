# Database Integration

This document explains how to use the database integration in the Nemesis template for Discord bots.

## 💾 Overview

The Nemesis template includes a Prisma-based database setup for your Discord bot. The database client is initialized in `src/lib/db.ts` and exposed as a singleton instance:

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
```

## Using the Database

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

## Prisma Schema

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

## Database Environment Setup

Add your database connection URL to the `.env` file:

```
DATABASE_URL="mysql://nemesis:nemesis@localhost:3306/nemesis"
```

## Common Database Patterns

### Storing Guild Settings

```typescript
// Creating or updating guild settings
async function updateGuildSettings(
  guildId: string,
  settings: Partial<GuildSettings>
) {
  await db.guildSettings.upsert({
    where: { guildId },
    update: settings,
    create: {
      guildId,
      ...settings,
    },
  });
}

// Retrieving guild settings
async function getGuildSettings(guildId: string) {
  return db.guildSettings.findUnique({
    where: { guildId },
  });
}
```

### Tracking User Statistics

```typescript
// Add XP to a user
async function addUserXP(userId: string, amount: number) {
  const profile = await db.userProfile.upsert({
    where: { userId },
    update: {
      xp: { increment: amount },
    },
    create: {
      userId,
      xp: amount,
    },
  });

  // Check for level up
  const newLevel = Math.floor(Math.sqrt(profile.xp) / 10) + 1;
  if (newLevel > profile.level) {
    await db.userProfile.update({
      where: { userId },
      data: { level: newLevel },
    });
    return { leveledUp: true, newLevel };
  }

  return { leveledUp: false };
}
```

## Database Migration

When you modify your Prisma schema, you'll need to generate a migration:

```bash
npx prisma migrate dev --name what_changed
```

This will create a migration file in `prisma/migrations` and update your database schema.
