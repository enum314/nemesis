import { Client, type ClientEvents } from "discord.js";

import {
  Compose,
  type ComposeMiddleware,
  type UnionToIntersection,
} from "#classes/compose";
import { Logger } from "#lib/logger";

type EventRunner<K extends keyof ClientEvents> = (
  client: Client<true>,
  ...args: ClientEvents[K]
) => Promise<void> | void;

export interface EventBaseContext {
  client: Client<true>;
}

export type EventMiddleware<
  Context extends EventBaseContext,
  NextContext extends {} = {},
> = ComposeMiddleware<Context, NextContext>;

export class Event<
  K extends keyof ClientEvents,
  Context extends EventBaseContext = EventBaseContext,
  Self extends Event<K, any, any> = any,
> extends Compose<Context, Event<K, EventBaseContext>> {
  private _runner!: EventRunner<K>;

  public constructor(
    public readonly name: K,
    public readonly once: boolean = false
  ) {
    super();

    this._runner = () => {
      throw new Error("Event runner not implemented");
    };
  }

  public get runner(): EventRunner<K> {
    return this._runner;
  }

  public run(
    runner: (ctx: Context, ...args: ClientEvents[K]) => Promise<void> | void
  ): this {
    this._runner = async (client, ...args) => {
      try {
        await this.compose({ client } as Context, (ctx) =>
          runner(ctx, ...args)
        );
      } catch (error) {
        Logger.error(`Event - ${this.name}`).error(error);
      }
    };

    return this;
  }

  public override use<NextContext extends {}>(
    fn: EventMiddleware<Context, NextContext>
  ): Event<K, Context & NextContext, Self> {
    const next = super.use(fn) as unknown as Event<
      K,
      Context & NextContext,
      Self
    >;

    return next;
  }

  public override parallel<NextContexts extends object[]>(fns: {
    [K in keyof NextContexts]: EventMiddleware<Context, NextContexts[K]>;
  }): Event<K, Context & UnionToIntersection<NextContexts[number]>, Self> {
    const next = super.parallel(fns) as unknown as Event<
      K,
      Context & UnionToIntersection<NextContexts[number]>,
      Self
    >;

    return next;
  }
}
