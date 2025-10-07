import {
  MessageFlags,
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type SlashCommandSubcommandBuilder,
  type SlashCommandSubcommandGroupBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

import {
  Compose,
  type ComposeMiddleware,
  type UnionToIntersection,
} from "#classes/compose";
import { Logger } from "#lib/logger";

type CommandRunner = (
  interaction: ChatInputCommandInteraction<"cached">
) => Promise<void> | void;

type CommandAutocompleter = (
  interaction: AutocompleteInteraction<"cached">
) => Promise<void> | void;

type CommandBuilder =
  | SlashCommandBuilder
  | SlashCommandSubcommandBuilder
  | SlashCommandSubcommandGroupBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export interface CommandBaseContext {
  interaction: ChatInputCommandInteraction<"cached">;
}

export type CommandMiddleware<
  Context extends CommandBaseContext,
  NextContext extends {} = {},
> = ComposeMiddleware<Context, NextContext>;

export class Command<
  Context extends CommandBaseContext = CommandBaseContext,
  Self extends Command<any, any> = any,
> extends Compose<Context, Command<CommandBaseContext>> {
  private _runner!: CommandRunner;
  private _autocompleter: CommandAutocompleter | null;

  public constructor(public readonly builder: CommandBuilder) {
    super();

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

  public get runner(): CommandRunner {
    return this._runner;
  }

  public get autocompleter(): CommandAutocompleter | null {
    return this._autocompleter;
  }

  public run(runner: (ctx: Context) => Promise<void> | void): this {
    this._runner = async (interaction) => {
      try {
        await this.compose({ interaction } as Context, runner);
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

  public override use<NextContext extends {}>(
    fn: CommandMiddleware<Context, NextContext>
  ): Command<Context & NextContext, Self> {
    const next = super.use(fn) as unknown as Command<
      Context & NextContext,
      Self
    >;

    return next;
  }

  public override parallel<NextContexts extends object[]>(fns: {
    [K in keyof NextContexts]: CommandMiddleware<Context, NextContexts[K]>;
  }): Command<Context & UnionToIntersection<NextContexts[number]>, Self> {
    const next = super.parallel(fns) as unknown as Command<
      Context & UnionToIntersection<NextContexts[number]>,
      Self
    >;

    return next;
  }
}
