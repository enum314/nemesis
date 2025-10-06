import "dotenv/config";

import path from "path";
import { fileURLToPath } from "url";
import { ShardingManager } from "discord.js";

import { env } from "#lib/env";
import { Logger, setAsShardManager } from "#lib/logger";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the bot's main file
const shardFile = path.join(__dirname, "index.js");

interface ShardingOptions {
  token?: string;
  totalShards?: number | "auto";
  respawn?: boolean;
  shardArgs?: string[];
  execArgv?: string[];
}

/**
 * Initialize the Discord bot with optional sharding
 * @param useSharding Whether to use sharding or not
 * @param options Sharding configuration options
 */
export async function initializeBot(
  useSharding = false,
  options: ShardingOptions = {}
) {
  // If sharding is disabled, just import and run the bot directly
  if (!useSharding) {
    await import("./index.js");

    return;
  }

  // Mark this process as the shard manager
  setAsShardManager();

  // Get token from options or environment variable

  const token = options.token || env.DISCORD_TOKEN;

  // Create and configure the ShardingManager
  const manager = new ShardingManager(shardFile, {
    token,
    totalShards: options.totalShards || "auto",
    respawn: options.respawn !== false, // Default to true if not specified
    shardArgs: options.shardArgs || [],
    execArgv: options.execArgv || [],
  });

  // Logging for shard events
  manager.on("shardCreate", (shard) => {
    Logger.info(`[Sharding] Launched shard ${shard.id}`);

    shard.on("ready", () => {
      Logger.info(`[Sharding] Shard ${shard.id} ready`);
    });

    shard.on("disconnect", () => {
      Logger.info(`[Sharding] Shard ${shard.id} disconnected`);
    });

    shard.on("reconnecting", () => {
      Logger.info(`[Sharding] Shard ${shard.id} reconnecting`);
    });

    shard.on("error", (error) => {
      Logger.error(`[Sharding] Shard ${shard.id} error:`, error);
    });
  });

  // Spawn shards
  try {
    Logger.info("[Sharding] Starting shards...");
    await manager.spawn();
    Logger.info("[Sharding] All shards spawned successfully");
  } catch (error) {
    Logger.error("[Sharding] Failed to spawn shards:", error);
    throw error;
  }
}
