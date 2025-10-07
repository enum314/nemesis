export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type ComposeMiddleware<
  Context extends {},
  NextContext extends {} = {},
> = (
  ctx: Context
) => Promise<NextContext | false | void> | NextContext | false | void;

export abstract class Compose<
  Context extends {} = {},
  Self extends Compose<any, any> = any,
> {
  private stack: ComposeMiddleware<any, any>[] = [];

  public use<NextContext extends {}>(
    fn: ComposeMiddleware<Context, NextContext>
  ): Compose<Context & NextContext, Self> & Self {
    this.stack.push(fn);

    // Mutates current instance but augments inferred context type
    return this as unknown as Compose<Context & NextContext, Self> & Self;
  }

  public parallel<NextContexts extends object[]>(fns: {
    [K in keyof NextContexts]: ComposeMiddleware<Context, NextContexts[K]>;
  }): Compose<Context & UnionToIntersection<NextContexts[number]>, Self> &
    Self {
    return this.use(async (ctx) => {
      const results = await Promise.all(fns.map((fn) => fn(ctx)));

      for (const result of results) {
        if (result === false) return false;
        else if (result && typeof result === "object")
          Object.assign(ctx, result);
      }

      return () => {};
    }) as unknown as Compose<
      Context & UnionToIntersection<NextContexts[number]>,
      Self
    > &
      Self;
  }

  protected async compose(
    initial: Context,
    runner: (ctx: Context) => Promise<void> | void
  ) {
    const ctx = { ...initial };

    for (const fn of this.stack) {
      const result = await fn(ctx);

      if (result === false) return;
      else if (result && typeof result === "object") Object.assign(ctx, result);
    }

    await runner(ctx);
  }
}
