import "dotenv/config";

import { GatewayIntentBits, type ClientEvents } from "discord.js";
import ms from "ms";

import { Addon } from "#classes/addon";
import { Client } from "#classes/client";
import { Command } from "#classes/command";
import { Event } from "#classes/event";
import { Configuration } from "#lib/configuration";
import { setCurrentShardId, setDiscordClient } from "#lib/logger";
import { getAllFiles } from "#utils/file-loader";

const startingTime = Date.now();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

// Set the client in the logger for shard detection
setDiscordClient(client);

// Only log startup message if not running as a shard
export const isShardProcess = !!client.shard;

if (!isShardProcess) {
  client.logger.info("Loading...");
}

function addCommand(command: Command, log = true) {
  client.commands.set(command.name, command);

  if (!isShardProcess && log) {
    client.logger.info(`- ${command.name}`);
  }
}

async function addEvent(
  client: Client<true>,
  event: Event<keyof ClientEvents>,
  log = true
) {
  if (event.name === "clientReady") {
    await event.runner(client);
  } else if (event.once) {
    client.once(event.name, (...args) =>
      event.runner(client as Client<true>, ...args)
    );
  } else {
    client.on(event.name, (...args) =>
      event.runner(client as Client<true>, ...args)
    );
  }

  client.events.set(event.name, event);

  if (!isShardProcess && log) {
    client.logger.info(`- ${event.name}`);
  }
}

async function addConfiguration(configuration: Configuration<any>, log = true) {
  await configuration.load();

  client.configurations.set(configuration.data.name, configuration);

  if (!isShardProcess && log) {
    client.logger.info(`- ${configuration.data.name}`);
  }
}

async function loadAddons() {
  const addonFiles = await getAllFiles(["addons"]);

  if (!isShardProcess && addonFiles.length > 0) {
    client.logger.info("[Addons] Loading addons...");
  }

  for (const file of addonFiles) {
    try {
      const filePath = `./${file}`;
      const module = await import(filePath);

      if (module.default instanceof Addon) {
        const addon = module.default as Addon;
        const addonName = addon.options.id;

        if (!isShardProcess) {
          client.logger.info(`- ${addonName}`);
        }

        client.addons.set(addonName, addon);

        const { commands, events, configurations } = await addon.loader();

        for (const command of commands) {
          addCommand(command, false);
        }

        for (const event of events) {
          await addEvent(client as Client<true>, event, false);
        }

        for (const configuration of configurations) {
          await addConfiguration(configuration, false);
        }
      }
    } catch (error) {
      if (!isShardProcess) {
        client.logger.error(`[Addons] Failed to load addon file ${file}`);
        client.logger.error(error);
      }
    }
  }

  if (!isShardProcess && addonFiles.length > 0) {
    client.logger.info(`[Addons] Loaded`);
  }
}

/**
 * Dynamically load all command files
 */
async function loadCommands() {
  const commandFiles = await getAllFiles(["commands"]);

  if (!isShardProcess && commandFiles.length > 0) {
    client.logger.info("[Commands] Loading commands...");
  }

  for (const file of commandFiles) {
    try {
      const filePath = `./${file}`;
      const module = await import(filePath);

      // Check if the file exports a Command instance
      if (module.default instanceof Command) {
        addCommand(module.default);
      }
    } catch (error) {
      if (!isShardProcess) {
        client.logger.error(`[Commands] Failed to load command file ${file}`);
        client.logger.error(error);
      }
    }
  }

  if (!isShardProcess && commandFiles.length > 0) {
    client.logger.info(`[Commands] Loaded`);
  }
}

/**
 * Dynamically load all event files
 */
async function loadEvents() {
  const eventFiles = await getAllFiles(["events"]);

  if (!isShardProcess && eventFiles.length > 0) {
    client.logger.info("[Events] Loading events...");
  }

  for (const file of eventFiles) {
    try {
      const filePath = `./${file}`;
      const module = await import(filePath);

      if (module.default instanceof Event) {
        await addEvent(client as Client<true>, module.default);
      }
    } catch (error) {
      if (!isShardProcess) {
        client.logger.error(`[Events] Failed to load event file ${file}`);
        client.logger.error(error);
      }
    }
  }

  if (!isShardProcess && eventFiles.length > 0) {
    client.logger.info(`[Events] Loaded`);
  }
}

/**
 * Preload all configuration files for faster access
 */
async function loadConfigurations() {
  const configurationFiles = await getAllFiles(["configs"]);

  if (!isShardProcess && configurationFiles.length > 0) {
    client.logger.info("[Configurations] Loading configurations...");
  }

  for (const file of configurationFiles) {
    try {
      const filePath = `./${file}`;
      const module = await import(filePath);

      if (module.default instanceof Configuration) {
        await addConfiguration(module.default);
      }
    } catch (error) {
      if (!isShardProcess) {
        client.logger.error(
          `[Configurations] Failed to load configuration file ${file}`
        );
        client.logger.error(error);
      }
    }
  }

  if (!isShardProcess && configurationFiles.length > 0) {
    client.logger.info(`[Configurations] Loaded`);
  }
}

if (!isShardProcess) {
  client.logger.info(`[Discord] Connecting...`);
}

client.once("clientReady", async () => {
  // We'll handle the ready log in the ready event file
  // since we want that log to appear for both non-sharded and sharded instances

  // Load commands and events
  await loadAddons();
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
