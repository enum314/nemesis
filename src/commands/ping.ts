import { codeBlock, SlashCommandBuilder } from "discord.js";
import ms from "pretty-ms";

import { Command } from "#classes/command";
import { cooldown } from "#middlewares/cooldown";

export default new Command(
  new SlashCommandBuilder().setName("ping").setDescription("Replies with pong!")
)
  // Apply cooldown
  .use(cooldown(10, { trigger: true }))

  // Measure latency
  .use(async ({ interaction }) => {
    const sent = await interaction.reply({
      content: "Pinging...",
      withResponse: true,
    });

    return {
      latency:
        (sent?.resource?.message?.createdTimestamp ?? 0) -
        interaction.createdTimestamp,
    };
  })

  // Generate random numbers in parallel
  .parallel([
    () => ({ a: Math.floor(Math.random() * 100) }),
    () => ({ b: Math.floor(Math.random() * 100) }),
    () => ({ c: Math.floor(Math.random() * 100) }),
    () => ({ d: Math.floor(Math.random() * 100) }),
    () => ({ e: Math.floor(Math.random() * 100) }),
  ])

  // Record start time
  .use(() => ({ start: Date.now() }))

  // Simulate async work in parallel
  .parallel([
    async ({ a }) => {
      await new Promise((r) => setTimeout(r, a * 10));
      return { aa: a * 10 };
    },
    async ({ b }) => {
      await new Promise((r) => setTimeout(r, b * 10));
      return { bb: b * 10 };
    },
    async ({ c }) => {
      await new Promise((r) => setTimeout(r, c * 10));
      return { cc: c * 10 };
    },
    async ({ d }) => {
      await new Promise((r) => setTimeout(r, d * 10));
      return { dd: d * 10 };
    },
    async ({ e }) => {
      await new Promise((r) => setTimeout(r, e * 10));
      return { ee: e * 10 };
    },
  ])

  // Record end time
  .use(() => ({ end: Date.now() }))

  // Runner: reply with results
  .run(async ({ interaction, latency, cooldown, start, end, ...ctx }) => {
    await interaction.editReply({
      content: `Pong! 🏓
Bot Latency: ${ms(latency)}
API Latency: ${interaction.client.ws.ping}ms
Time Elapsed: ${ms(end - start)}
${codeBlock("json", JSON.stringify(ctx, null, 2))}`,
    });

    // Trigger cooldown after execution
    cooldown.trigger();
  });
