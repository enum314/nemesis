import { EmbedBuilder } from "discord.js";

import { Event } from "../../../classes/event.js";
import { mustache } from "../../../utils/mustache.js";
import goodbyeConfig from "../configs/goodbye.js";

const event = new Event("guildMemberRemove", async (_, member) => {
  // Get the configuration
  const config = await goodbyeConfig.get();

  // If channel is not set, do nothing
  if (!config.goodbyeChannelId) return;

  // Get the channel
  const goodbyeChannel = member.guild.channels.cache.get(
    config.goodbyeChannelId
  );
  if (!goodbyeChannel || !goodbyeChannel.isTextBased()) return;

  // Create goodbye message
  const goodbyeMessage = mustache(config.goodbyeMessage, {
    user: member.user.username,
  });

  // Create embed
  const embed = new EmbedBuilder()
    .setColor(config.goodbyeColor as `#${string}`)
    .setTitle(`Member Left ${member.guild.name}`)
    .setDescription(goodbyeMessage)
    .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
    .setTimestamp()
    .setFooter({
      text: `Members: ${member.guild.memberCount}`,
      iconURL: member.guild.iconURL() || undefined,
    });

  // Send goodbye message
  await goodbyeChannel.send({ embeds: [embed] });
});

export default event;
