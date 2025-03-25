import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Global variable that will be set if we're in a shard
let currentShardId: number | null = null;

// Function to set the current shard ID
export function setCurrentShardId(shardId: number): void {
  currentShardId = shardId;
}

// Custom format to add shard information
const shardInfoFormat = winston.format((info) => {
  // Check if we're in a sharded environment
  if (currentShardId !== null) {
    info.shardId = `[Shard ${currentShardId}]`;
  } else if (process.env.ENABLE_SHARDING === "true") {
    info.shardId = "[Shard Manager]";
  } else {
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

const dailyFileRotateFileTransport = new DailyRotateFile({
  dirname: "logs",
  filename: `%DATE%.log`,
  datePattern: "YYYY-MM-DD-HH",
  auditFile: `logs${path.sep}audit.json`,
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "1d",
  createSymlink: true,
  symlinkName: `logs${path.sep}latest.log`,
  format: winston.format.combine(
    ...formats,
    winston.format.printf(({ level, message, stack, timestamp, shardId }) => {
      return `[${timestamp}]${shardId ? ` ${shardId}` : ""} [${level}] ${stack ?? message}`;
    })
  ),
});

export const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(...formats),
  transports: [consoleTransport, dailyFileRotateFileTransport],
});
