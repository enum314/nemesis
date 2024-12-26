import Mustache from "mustache";

Mustache.tags = ["{{", "}}"];

Mustache.escape = (text: string) => text;

export function mustache(template: string, data: Record<string, any>) {
  return Mustache.render(template, data);
}
