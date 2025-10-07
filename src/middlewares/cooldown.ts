import { Collection, MessageFlags } from "discord.js";
import ms from "pretty-ms";

import type { CommandBaseContext, CommandMiddleware } from "#classes/command";
import { mustache } from "#utils/mustache";

const cooldowns = new Collection<string, Map<string, number>>();

/**
 * Creates a cooldown middleware.
 * @param seconds The cooldown duration in seconds.
 * @param message Optional message with {{remaining}} placeholder.
 */
export function cooldown(
  seconds: number,
  message: `${string}{{remaining}}${string}` = "Please wait **{{remaining}}** before using this command again."
): CommandMiddleware<
  CommandBaseContext,
  {
    cooldown: {
      trigger: () => void;
    };
  }
> {
  const duration = seconds * 1000;

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

    return {
      cooldown: {
        trigger: () => {
          // Set new cooldown
          timestamps.set(userId, now + duration);

          // Auto-cleanup after expiration
          setTimeout(() => timestamps.delete(userId), duration);
        },
      },
    };
  };
}
