function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;

  const proto = Object.getPrototypeOf(value);
  return (
    (proto === null ||
      proto === Object.prototype ||
      Object.getPrototypeOf(proto) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
  );
}

export function merge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>,
  options = { clone: true }
): T {
  const output: Record<string, unknown> = options.clone
    ? { ...target }
    : target;

  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key of Object.keys(source)) {
      if (key === "__proto__") continue;

      const sourceVal = source[key];
      const targetVal = (target as Record<string, unknown>)[key];

      if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
        output[key] = merge(
          targetVal as Record<string, unknown>,
          sourceVal as Record<string, unknown>,
          options
        );
      } else {
        output[key] = sourceVal;
      }
    }
  }

  return output as T;
}
