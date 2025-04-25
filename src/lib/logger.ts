import { Client } from "discord.js";
import winston from "winston";

// Global variables for shard detection
let currentShardId: number | null = null;
let isShardManager = false;

// Client instance that will be set to check for sharding
let discordClient: Client | null = null;

// Function to set the Discord client for shard detection
export function setDiscordClient(client: Client): void {
  discordClient = client;
}

// Function to mark this process as the shard manager
export function setAsShardManager(): void {
  isShardManager = true;
}

// Function to set the current shard ID (maintained for backward compatibility)
export function setCurrentShardId(shardId: number): void {
  currentShardId = shardId;
}

// Custom format to add shard information
const shardInfoFormat = winston.format((info) => {
  // First check: explicitly set shard ID
  if (currentShardId !== null) {
    info.shardId = `[Shard ${currentShardId}]`;
  }
  // Second check: check client's shard property
  else if (discordClient?.shard) {
    const shardId = discordClient.shard.ids[0];
    info.shardId = `[Shard ${shardId}]`;
    // Cache the shard ID for future logs
    currentShardId = shardId;
  }
  // Third check: if marked as shard manager
  else if (isShardManager) {
    info.shardId = "[Shard Manager]";
  }
  // Not sharded
  else {
    info.shardId = "";
  }
  return info;
});

const formats = [
  winston.format.prettyPrint(),
  winston.format.timestamp({ format: "hh:mm:ss A" }),
  winston.format.errors({ stack: true }),
  shardInfoFormat(),
];

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    ...formats,
    winston.format.printf(({ level, message, stack, timestamp, shardId }) => {
      return `[\x1b[90m${timestamp}\x1b[0m]${shardId ? ` ${shardId}` : ""} [${level}] ${stack ?? message}`;
    })
  ),
});

// Create and export the logger with console transport only
export const Logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(...formats),
  transports: [consoleTransport],
});
