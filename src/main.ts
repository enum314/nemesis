import "dotenv/config";

import ms from "ms";

import { env } from "#lib/env";
import { Logger } from "#lib/logger";
import { initializeBot } from "#root/sharding";

const startingTime = Date.now();

// Start the bot with or without sharding
(async () => {
  try {
    await initializeBot(env.SHARDING, {
      totalShards: env.SHARDS,
      // Additional options can be configured here
    });

    if (env.SHARDING) {
      Logger.info(`Done! ${ms(Date.now() - startingTime)}`);
    }
  } catch (error) {
    Logger.error("Failed to start bot:", error);
    process.exit(1);
  }
})();
