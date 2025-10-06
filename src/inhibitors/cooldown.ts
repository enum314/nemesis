import {
  ChatInputCommandInteraction,
  Collection,
  MessageFlags,
} from "discord.js";
import ms from "pretty-ms";

import type { Command } from "#classes/command";
import { mustache } from "#utils/mustache";

const cooldowns = new Collection<string, Map<string, number>>();

/**
 * Creates a cooldown inhibitor.
 * @param seconds The cooldown duration in seconds.
 */
export function cooldown(
  seconds: number,
  message: `${string}{{remaining}}${string}` = "Please wait **{{remaining}}** before using this command again."
) {
  const duration = seconds * 1000;

  return async (
    interaction: ChatInputCommandInteraction<"cached">,
    command: Command
  ) => {
    const now = Date.now();
    const userId = interaction.user.id;
    const name = command.name;

    if (!cooldowns.has(name)) {
      cooldowns.set(name, new Map());
    }

    const timestamps = cooldowns.get(name)!;

    // If user has an active cooldown
    if (timestamps.has(userId)) {
      const expiration = timestamps.get(userId)!;

      if (now < expiration) {
        const remaining = expiration - now;

        await interaction.reply({
          content: mustache(message, {
            remaining: ms(remaining),
          }),
          flags: [MessageFlags.Ephemeral],
        });

        return false; // inhibit execution
      }
    }

    // Set new cooldown
    timestamps.set(userId, now + duration);

    // Auto-cleanup after expiration
    setTimeout(() => timestamps.delete(userId), duration);

    return true; // allow execution
  };
}
