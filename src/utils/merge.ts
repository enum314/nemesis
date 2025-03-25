import { isPlainObject } from "is-plain-object";

export function merge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  options = { clone: true }
) {
  const output = options.clone ? { ...target } : target;

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      if (key === "__proto__") return;
      if (isPlainObject(source[key]) && key in target) {
        output[key] = merge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>,
          options
        );
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}
