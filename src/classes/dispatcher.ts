import {
  ApplicationCommand,
  ChatInputCommandInteraction,
  Client,
  REST,
  Routes,
} from "discord.js";

import type { Command } from "#classes/command";
import { inhibitors } from "#functions/inhibitors";
import { env } from "#lib/env";
import { existsFile, readFile, writeFile } from "#lib/fs";

export class Dispatcher {
  public readonly awaiting: Set<string>;

  private init: boolean;

  public constructor(private client: Client<true>) {
    this.awaiting = new Set();
    this.init = false;
  }

  private async sync() {
    const commands = this.client.commands.map((command) =>
      command.builder.toJSON()
    );

    if (!this.client.application?.owner) {
      await this.client.application?.fetch();
    }

    let modified = false;

    if (await existsFile(["cache.json"])) {
      try {
        const currentCommands = JSON.parse(
          (await readFile(["cache.json"])).toString()
        );

        const newCommands = commands.filter(
          (command) =>
            !currentCommands.some(
              (c: { name: string }) => c.name === command.name
            )
        );

        if (newCommands.length) {
          throw new Error();
        }

        const deletedCommands = currentCommands.filter(
          (command: { name: string }) =>
            !commands.some((c) => c.name === command.name)
        );

        if (deletedCommands.length) {
          throw new Error();
        }

        const updatedCommands = commands.filter((command) =>
          currentCommands.some((c: { name: string }) => c.name === command.name)
        );

        for (const updatedCommand of updatedCommands) {
          const previousCommand = currentCommands.find(
            (c: { name: string }) => c.name === updatedCommand.name
          );

          if (!previousCommand) continue;

          if (previousCommand.description !== updatedCommand.description) {
            throw new Error();
          }

          if (
            !ApplicationCommand.optionsEqual(
              previousCommand.options ?? [],
              updatedCommand.options ?? []
            )
          ) {
            throw new Error();
          }
        }
      } catch (_err) {
        modified = true;
      }
    } else {
      modified = true;
    }

    if (modified) {
      this.client.logger.info(
        `[Dispatcher] Syncing ${commands.length} Slash Command${
          commands.length > 1 ? "s" : ""
        }...`
      );

      const rest = new REST().setToken(this.client.token);

      await rest.put(
        env.DISCORD_GUILD_ID
          ? Routes.applicationGuildCommands(
              this.client.user.id,
              env.DISCORD_GUILD_ID
            )
          : Routes.applicationCommands(this.client.user.id),
        {
          body: commands,
        }
      );

      await writeFile(["cache.json"], JSON.stringify(commands));

      this.client.logger.info(
        `[Dispatcher] ${commands.length} Slash Command${
          commands.length > 1 ? "s" : ""
        } synced!`
      );
    }
  }

  private async inihibit(
    interaction: ChatInputCommandInteraction<"cached">,
    command: Command
  ) {
    for (const inhibitor of inhibitors) {
      if (!(await Promise.resolve(inhibitor(interaction, command)))) {
        return true;
      }
    }
    return false;
  }

  public async initialize() {
    if (this.init) {
      throw new Error(`Dispatcher has already been initialized`);
    }

    this.init = true;

    await this.sync();

    this.client.on("interactionCreate", async (interaction) => {
      if (
        interaction.user.bot ||
        this.awaiting.has(interaction.user.id) ||
        !interaction.isChatInputCommand() ||
        !interaction.inCachedGuild()
      ) {
        return;
      }

      const command = this.client.commands.get(interaction.commandName);

      if (!command) {
        return;
      }

      this.awaiting.add(interaction.user.id);

      if (!(await this.inihibit(interaction, command))) {
        await command.runner(interaction);
      }

      this.awaiting.delete(interaction.user.id);
    });

    this.client.on("interactionCreate", async (interaction) => {
      if (
        interaction.user.bot ||
        this.awaiting.has(interaction.user.id) ||
        !interaction.isAutocomplete() ||
        !interaction.inCachedGuild()
      ) {
        return;
      }

      const command = this.client.commands.get(interaction.commandName);

      if (!command) {
        return;
      }

      if (!command.autocompleter) {
        return;
      }

      this.awaiting.add(interaction.user.id);

      await command.autocompleter(interaction);

      this.awaiting.delete(interaction.user.id);
    });
  }
}
