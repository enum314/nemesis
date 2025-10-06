import { ChatInputCommandInteraction, Client, REST, Routes } from "discord.js";
import { deepEqual } from "fast-equals";
import yaml from "yaml";

import type { Command } from "#classes/command";
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

    let modified = false;

    if (await existsFile(["cache.yml"])) {
      const buffer = await readFile(["cache.yml"]);

      const data = yaml.parse(buffer.toString());

      modified = !deepEqual(
        JSON.parse(JSON.stringify(data)),
        JSON.parse(JSON.stringify(commands))
      );
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

      await writeFile(["cache.yml"], yaml.stringify(commands));

      this.client.logger.info(
        `[Dispatcher] ${commands.length} Slash Command${
          commands.length > 1 ? "s" : ""
        } synced!`
      );
    }
  }

  private async inhibit(
    inhibitors: ((
      interaction: ChatInputCommandInteraction<"cached">,
      command: Command
    ) => Promise<boolean> | boolean)[],
    interaction: ChatInputCommandInteraction<"cached">,
    command: Command
  ) {
    for (const inhibitor of inhibitors) {
      // if the inhibitor returns false, stop the chain immediately
      const shouldContinue = await Promise.resolve(
        inhibitor(interaction, command)
      );
      if (!shouldContinue) return false;
    }

    // all inhibitors returned true — continue
    return true;
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
        !interaction.inCachedGuild() ||
        !(interaction.isChatInputCommand() || interaction.isAutocomplete())
      ) {
        return;
      }

      const command = this.client.commands.get(interaction.commandName);

      if (!command) return;

      this.awaiting.add(interaction.user.id);

      try {
        if (interaction.isChatInputCommand()) {
          if (await this.inhibit(command.inhibitors, interaction, command)) {
            await command.runner(interaction);
          }
        } else if (interaction.isAutocomplete()) {
          if (command.autocompleter) {
            await command.autocompleter(interaction);
          }
        }
      } catch (err) {
        this.client.logger.error(
          `[Dispatcher] Error handling ${interaction.commandName}:`,
          err
        );
      } finally {
        this.awaiting.delete(interaction.user.id);
      }
    });
  }
}
