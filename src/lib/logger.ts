import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const formats = [
  winston.format.prettyPrint(),
  winston.format.timestamp({ format: "hh:mm:ss A" }),
  winston.format.errors({ stack: true }),
];

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    ...formats,
    winston.format.printf(({ level, message, stack, timestamp }) => {
      return `[\x1b[90m${timestamp}\x1b[0m] [${level}] ${stack ?? message}`;
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
    winston.format.printf(({ level, message, stack, timestamp }) => {
      return `[${timestamp}] [${level}] ${stack ?? message}`;
    })
  ),
});

export const Logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(...formats),
  transports: [consoleTransport, dailyFileRotateFileTransport],
});
