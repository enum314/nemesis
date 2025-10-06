import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

import { Logger } from "#lib/logger";

type CommandRunner = (
  interaction: ChatInputCommandInteraction<"cached">
) => Promise<void> | void;

type CommandAutocompleter = (
  interaction: AutocompleteInteraction<"cached">
) => Promise<void> | void;

type CommandInhibitor = (
  interaction: ChatInputCommandInteraction<"cached">
) => Promise<boolean> | boolean;

type CommandBuilder =
  | SlashCommandBuilder
  | SlashCommandSubcommandBuilder
  | SlashCommandSubcommandGroupBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export class Command {
  private _runner!: CommandRunner;
  private _autocompleter: CommandAutocompleter | null;
  private _inhibitors: CommandInhibitor[] = [];

  public constructor(public readonly builder: CommandBuilder) {
    this._runner = async (interaction) => {
      await interaction.reply({
        content: "This command is not implemented yet.",
        flags: [MessageFlags.Ephemeral],
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

  public get inhibitors(): CommandInhibitor[] {
    return this._inhibitors;
  }

  public get runner(): CommandRunner {
    return this._runner;
  }

  public get autocompleter(): CommandAutocompleter | null {
    return this._autocompleter;
  }

  public inhibit(inhibitor: CommandInhibitor): this {
    this._inhibitors.push(inhibitor);

    return this;
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
