import { Collection, MessageFlags } from "discord.js";
import ms from "pretty-ms";

import type { CommandBaseContext, CommandMiddleware } from "#classes/command";
import { mustache } from "#utils/mustache";

const cooldowns = new Collection<string, Map<string, number>>();

export function cooldown<T extends boolean>(
  seconds: number,
  opts: { message?: `${string}{{remaining}}${string}`; trigger?: T } = {}
): CommandMiddleware<
  CommandBaseContext,
  T extends true ? { cooldown: { trigger: () => void } } : {}
> {
  const duration = seconds * 1000;

  const message =
    opts?.message ??
    "Please wait **{{remaining}}** before using this command again.";

  return async (ctx) => {
    const { interaction } = ctx;

    const now = Date.now();
    const userId = interaction.user.id;
    const commandName = interaction.commandName;

    if (!cooldowns.has(commandName)) {
      cooldowns.set(commandName, new Map());
    }

    const timestamps = cooldowns.get(commandName)!;

    // If user has an active cooldown
    if (timestamps.has(userId)) {
      const expiration = timestamps.get(userId)!;

      if (now < expiration) {
        const remaining = expiration - now;

        await interaction.reply({
          content: mustache(message, { remaining: ms(remaining) }),
          flags: [MessageFlags.Ephemeral],
        });

        return false; // stop the middleware chain
      }
    }

    const trigger = () => {
      timestamps.set(userId, now + duration);
      setTimeout(() => timestamps.delete(userId), duration);
    };

    if (opts?.trigger) {
      return { cooldown: { trigger } } as any;
    }

    trigger();

    return {};
  };
}
