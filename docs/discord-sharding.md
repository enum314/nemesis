# Discord Bot Sharding

This document explains how to use the Discord.js sharding system in the Nemesis template.

## 🤖 What is Sharding?

Discord requires sharding for bots in 2,500+ guilds. Sharding splits your bot into multiple processes, each handling a portion of the guilds, which:

- Reduces memory usage and CPU load per process
- Improves performance by distributing workload
- Is required by Discord for larger bots

## Using Sharding

Sharding is managed through the `main.ts` file which reads environment variables to determine whether to enable sharding:

**Environment Variables**:

- `DISCORD_SHARDING`: Set to "true" to enable sharding
- `DISCORD_SHARDS`: Number of shards to spawn, or "auto" to let Discord.js decide

You can enable sharding by setting these environment variables before starting your bot:

```bash
# Enable sharding with environment variables
DISCORD_SHARDING=true node .

# Or with a specific number of shards
DISCORD_SHARDING=true DISCORD_SHARDS=2 node .
```

The sharding implementation is handled in `src/sharding.ts` and automatically manages shard creation, monitoring, and error handling.
