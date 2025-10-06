import "dotenv/config";

import ms from "ms";

import { env } from "#lib/env";
import { Logger } from "#lib/logger";

import { initializeBot } from "./sharding.js";

const startingTime = Date.now();

// Start the bot with or without sharding
(async () => {
  try {
    await initializeBot(env.DISCORD_SHARDING, {
      totalShards: env.DISCORD_SHARDS,
      // Additional options can be configured here
    });

    if (env.DISCORD_SHARDING) {
      Logger.info(`Done! ${ms(Date.now() - startingTime)}`);
    }
  } catch (error) {
    Logger.error("Failed to start bot:", error);
    process.exit(1);
  }
})();
