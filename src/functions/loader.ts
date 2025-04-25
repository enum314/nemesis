import type { ClientEvents } from "discord.js";

import { Addon, type AddonOptions } from "../classes/addon.js";
import { Command } from "../classes/command.js";
import { Event } from "../classes/event.js";
import client, { isShardProcess } from "../index.js";
import { Configuration } from "../lib/configuration.js";
import { getAllFiles } from "../utils/file-loader.js";

export function registerAddon(metadata: AddonOptions) {
  const loader = async () => {
    const files = await getAllFiles(["addons", metadata.id]);

    const commands: Command[] = [];
    const events: Event<keyof ClientEvents>[] = [];
    const configurations: Configuration<any>[] = [];

    for (const file of files) {
      try {
        // For ESM imports we need to keep the extension
        const module = await import(`../${file}`);
        // Load commands, events and configurations
        if (module.default instanceof Command) {
          commands.push(module.default);
        } else if (module.default instanceof Event) {
          events.push(module.default);
        } else if (module.default instanceof Configuration) {
          configurations.push(module.default);
        }
      } catch (error) {
        if (!isShardProcess) {
          client.logger.error(
            `[Addon] [${metadata.id}] Failed to load file ${file}`
          );
          client.logger.error(error);
        }
      }
    }

    return { commands, events, configurations };
  };

  return new Addon(metadata, loader);
}
