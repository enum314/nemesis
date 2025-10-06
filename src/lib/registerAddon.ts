import type { ClientEvents } from "discord.js";

import { Addon, type AddonOptions } from "#classes/addon";
import { Command } from "#classes/command";
import { Event } from "#classes/event";
import { Configuration } from "#lib/configuration";
import client, { isShardProcess } from "#root/index";
import { getAllFiles } from "#utils/file-loader";

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
