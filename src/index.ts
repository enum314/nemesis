import "dotenv/config";

import { GatewayIntentBits } from "discord.js";
import ms from "ms";

import { Client } from "./classes/client.js";
import { Command } from "./classes/command.js";
import { Event } from "./classes/event.js";
import { Configuration } from "./lib/configuration.js";
import { setCurrentShardId, setDiscordClient } from "./lib/logger.js";
import { getAllFiles } from "./utils/loadFiles.js";

const startingTime = Date.now();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Set the client in the logger for shard detection
setDiscordClient(client);

// Only log startup message if not running as a shard
const isShardProcess = !!client.shard;
if (!isShardProcess) {
  client.logger.info("Loading...");
}

/**
 * Dynamically load all command files
 */
async function loadCommands() {
  if (!isShardProcess) {
    client.logger.info("[Commands] Loading commands...");
  }
  const commandFiles = getAllFiles("commands");

  for (const file of commandFiles) {
    try {
      // For ESM imports we need to keep the extension
      const filePath = `./${file}`;
      const module = await import(filePath);

      // Check if the file exports a Command instance
      if (module.default instanceof Command) {
        client.commands.set(module.default.name, module.default);
        if (!isShardProcess) {
          client.logger.info(`- ${module.default.name}`);
        }
      } else {
        if (!isShardProcess) {
          client.logger.warn(
            `[Commands] Skipping file ${file}: Command instance not found`
          );
        }
      }
    } catch (error) {
      client.logger.error(`[Commands] Failed to load command file ${file}`);
      client.logger.error(error);
    }
  }

  if (!isShardProcess) {
    client.logger.info(
      `[Commands] Loaded ${client.commands.size} command${client.commands.size > 1 ? "s" : ""}`
    );
  }
}

/**
 * Dynamically load all event files
 */
async function loadEvents() {
  if (!isShardProcess) {
    client.logger.info("[Events] Loading events...");
  }
  const eventFiles = getAllFiles("events");

  for (const file of eventFiles) {
    try {
      // For ESM imports we need to keep the extension
      const filePath = `./${file}`;
      const module = await import(filePath);

      // Check if the file exports an Event instance
      if (module.default instanceof Event) {
        const event = module.default;
        const eventName = event.name;

        if (event.once) {
          client.once(eventName, (...args) => {
            event.run(client, ...args);
          });
        } else {
          client.on(eventName, (...args) => {
            event.run(client, ...args);
          });
        }

        client.events.set(eventName, event);
        if (!isShardProcess) {
          client.logger.info(`- ${eventName}`);
        }
      } else {
        if (!isShardProcess) {
          client.logger.warn(
            `[Events] Skipping file ${file}: Event instance not found`
          );
        }
      }
    } catch (error) {
      client.logger.error(`[Events] Failed to load event file ${file}`);
      client.logger.error(error);
    }
  }

  if (!isShardProcess) {
    client.logger.info(
      `[Events] Loaded ${client.events.size} event${client.events.size > 1 ? "s" : ""}`
    );
  }
}

/**
 * Preload all configuration files for faster access
 */
async function loadConfigurations() {
  const configurationFiles = getAllFiles("configs");

  for (const file of configurationFiles) {
    const filePath = `./${file}`;

    const module = await import(filePath);

    if (module.default instanceof Configuration) {
      await module.default.load();
    }
  }
}

if (!isShardProcess) {
  client.logger.info(`[Discord] Connecting...`);
}

client.once("ready", async () => {
  // We'll handle the ready log in the ready event file
  // since we want that log to appear for both non-sharded and sharded instances

  // Load commands and events
  await loadCommands();
  await loadEvents();
  await loadConfigurations();

  await client.dispatcher.initialize();

  if (!isShardProcess) {
    client.logger.info(`[Discord] ${client.user?.tag} / ${client.user?.id}`);
    client.logger.info(`Done! ${ms(Date.now() - startingTime)}`);
  } else {
    if (client.shard) {
      setCurrentShardId(client.shard.ids[0]);
    }
  }
});

client.login().catch((error: Error) => client.logger.error(error));

export default client;
