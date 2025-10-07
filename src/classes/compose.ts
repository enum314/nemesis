export type ComposeMiddleware<
  Context extends {},
  NextContext extends {} = {},
> = (
  ctx: Readonly<Context>
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

  protected async compose(initial: Context): Promise<Context | undefined> {
    const ctx = { ...initial } as Record<string, any>;

    for (const fn of this.stack) {
      const result = await fn(Object.freeze(ctx));

      if (result === false) {
        return undefined;
      }

      if (result && typeof result === "object") {
        Object.assign(ctx, result);
      }
    }

    return ctx as Context;
  }
}
