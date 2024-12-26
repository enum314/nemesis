import { isPlainObject } from "is-plain-object";

export function merge(target: any, source: any, options = { clone: true }) {
  const output = options.clone ? { ...target } : target;

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      if (key === "__proto__") return;
      if (isPlainObject(source[key]) && key in target) {
        output[key] = merge(target[key], source[key], options);
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}
