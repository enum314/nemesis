import { SlashCommandBuilder } from "discord.js";

import { Command } from "#classes/command";
import { cooldown } from "#inhibitors/cooldown";

const command = new Command(
  new SlashCommandBuilder().setName("ping").setDescription("Replies with pong!")
)
  .use(cooldown(3))
  .run(async (interaction) => {
    const sent = await interaction.reply({
      content: "Pinging...",
      withResponse: true,
    });

    const latency =
      (sent?.resource?.message?.createdTimestamp ?? 0) -
      interaction.createdTimestamp;

    await interaction.editReply({
      content: `Pong! 🏓\nBot Latency: ${latency}ms\nAPI Latency: ${interaction.client.ws.ping}ms`,
    });
  });

export default command;
