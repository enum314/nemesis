import "dotenv/config";

import ms from "ms";

import { Logger } from "./lib/logger.js";
import { initializeBot } from "./sharding.js";

const startingTime = Date.now();

// Configuration can be loaded from environment variables or a config file
const ENABLE_SHARDING = process.env.ENABLE_SHARDING === "true";
const TOTAL_SHARDS = process.env.TOTAL_SHARDS
  ? process.env.TOTAL_SHARDS === "auto"
    ? "auto"
    : parseInt(process.env.TOTAL_SHARDS)
  : "auto";

// Start the bot with or without sharding
(async () => {
  try {
    Logger.info(
      `Starting bot with sharding ${ENABLE_SHARDING ? "enabled" : "disabled"}`
    );

    await initializeBot(ENABLE_SHARDING, {
      totalShards: TOTAL_SHARDS,
      // Additional options can be configured here
    });

    Logger.info(`Done! ${ms(Date.now() - startingTime)}`);
  } catch (error) {
    Logger.error("Failed to start bot:", error);
    process.exit(1);
  }
})();
