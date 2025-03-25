import Mustache from "mustache";

Mustache.tags = ["{{", "}}"];

Mustache.escape = (text: string) => text;

export function mustache(template: string, data: Record<string, unknown>) {
  return Mustache.render(template, data);
}
