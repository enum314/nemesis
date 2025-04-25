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

## 🛠️ Additional Resources

- [Discord.js Documentation](https://discord.js.org/#/docs)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [Discord.js Guide](https://discordjs.guide/)
