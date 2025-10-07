import { EmbedBuilder } from "discord.js";

import goodbyeConfig from "#addons/welcomer/configs/goodbye";
import { Event } from "#classes/event";
import { mustache } from "#utils/mustache";

export default new Event("guildMemberRemove")
  .use(async () => ({ config: await goodbyeConfig.get() }))
  .run(async ({ config }, member) => {
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
