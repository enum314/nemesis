import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionCollector,
} from "discord.js";

import { mustache } from "./mustache";

export async function paginate(
  interaction: ChatInputCommandInteraction<"cached">,
  embeds: EmbedBuilder[],
  opts: {
    rows: ActionRowBuilder<ButtonBuilder>[][];
  }
) {
  let index = 0;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("previous")
      .setDisabled(true),
    new ButtonBuilder()
      .setEmoji("❌")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId("terminate")
      .setDisabled(embeds.length === 1),
    new ButtonBuilder()
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("next")
      .setDisabled(embeds.length < 2)
  );

  await interaction.reply({
    embeds: [
      embeds[index].setFooter({
        text: mustache("Page {{page.current}} of {{page.total}}", {
          page: {
            current: index + 1,
            total: embeds.length,
          },
        }),
      }),
    ],
    fetchReply: true,
    components: [
      ...(embeds.length === 1 ? [] : [row]),
      ...(opts?.rows[
        index < opts.rows.length ? index : opts.rows.length - 1 // prevent out of bounds
      ] || []),
    ],
  });

  if (embeds.length === 1) return null;

  const collector = interaction.channel?.createMessageComponentCollector({
    filter: (m) => m.user.id === interaction.user.id,
    time: 60000,
  });

  if (collector) {
    collector.on("collect", async (message) => {
      switch (message.customId) {
        case "previous":
          index--;
          break;
        case "next":
          index++;
          break;
        case "terminate":
          return collector.stop();
        default:
          return;
      }

      row.setComponents(
        new ButtonBuilder()
          .setEmoji("◀️")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("previous")
          .setDisabled(index === 0),
        new ButtonBuilder()
          .setEmoji("❌")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("terminate"),
        new ButtonBuilder()
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("next")
          .setDisabled(index === embeds.length - 1)
      );

      await message.update({
        embeds: [
          embeds[index].setFooter({
            text: mustache("Page {{page.current}} of {{page.total}}", {
              page: {
                current: index + 1,
                total: embeds.length,
              },
            }),
          }),
        ],
        components: [
          row,
          ...(opts?.rows[
            index < opts.rows.length ? index : opts.rows.length - 1 // prevent out of bounds
          ] || []),
        ],
      });
    });

    collector.on("end", async () => {
      await interaction.editReply({ components: [] });
    });

    return collector as InteractionCollector<ButtonInteraction<"cached">>;
  }

  return null;
}
