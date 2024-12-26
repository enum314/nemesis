import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

import { Logger } from "../lib/logger";

type CommandRunner = (
  interaction: ChatInputCommandInteraction<"cached">
) => Promise<any> | any;

type CommandAutocompleter = (
  interaction: AutocompleteInteraction<"cached">
) => Promise<any> | any;

type CommandBuilder =
  | SlashCommandBuilder
  | SlashCommandSubcommandBuilder
  | SlashCommandSubcommandGroupBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export class Command {
  private _runner!: CommandRunner;
  private _autocompleter: CommandAutocompleter | null;

  public constructor(public readonly builder: CommandBuilder) {
    this._runner = async (interaction) => {
      await interaction.reply({
        content: "This command is not implemented yet.",
        ephemeral: true,
      });
    };

    this._autocompleter = null;
  }

  public get name(): string {
    return this.builder.name;
  }

  public get description(): string {
    return this.builder.description ?? "";
  }

  public get runner(): CommandRunner {
    return this._runner;
  }

  public get autocompleter(): CommandAutocompleter | null {
    return this._autocompleter;
  }

  public run(runner: CommandRunner): this {
    this._runner = async (interaction) => {
      try {
        await runner(interaction);
      } catch (error) {
        Logger.error(`Command - ${this.name}`).error(error);
      }
    };

    return this;
  }

  public autocomplete(autocompleter: CommandAutocompleter): this {
    this._autocompleter = async (interaction) => {
      try {
        await autocompleter(interaction);
      } catch (error) {
        Logger.error(`Command - ${this.name}`).error(error);
      }
    };

    return this;
  }
}
