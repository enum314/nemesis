import "dotenv/config";

import { GatewayIntentBits } from "discord.js";
import ms from "ms";

import { Client } from "./classes/client.js";
import { commands } from "./commands/index.js";
import { events } from "./events/index.js";

const startingTime = Date.now();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.logger.info("Loading...");

client.logger.info(`[Discord] Connecting...`);

client.once("ready", async () => {
  client.logger.info(`[Discord] Connected!`);

  client.logger.info(
    `[Commands] Loading ${commands.length} command${commands.length === 1 ? "" : "s"}`
  );

  for (const command of commands) {
    client.commands.set(command.name, command);

    client.logger.info(`- ${command.name}`);
  }

  client.logger.info(
    `[Events] Loading ${events.length} event${events.length === 1 ? "" : "s"}`
  );

  for (const event of events) {
    if (event.once) {
      client.once(event.eventName, (...args) => {
        event.once?.(client, ...args);
      });
    }

    if (event.on) {
      client.on(event.eventName, (...args) => {
        event.on?.(client, ...args);
      });
    }

    client.logger.info(`- ${event.eventName} ${event.once ? "(once)" : ""}`);
  }

  await client.dispatcher.initialize();

  client.logger.info(`[Discord] ${client.user?.tag} / ${client.user?.id}`);

  client.logger.info(`Done! ${ms(Date.now() - startingTime)}`);
});

client.login().catch((error) => client.logger.error(error));
