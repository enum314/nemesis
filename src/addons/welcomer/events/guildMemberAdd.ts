import { EmbedBuilder, userMention } from "discord.js";

import welcomeConfig from "#addons/welcomer/configs/welcome";
import { Event } from "#classes/event";
import { mustache } from "#utils/mustache";

const event = new Event("guildMemberAdd", async (_, member) => {
  // Get the configuration
  const config = await welcomeConfig.get();

  // If channel is not set, do nothing
  if (!config.welcomeChannelId) return;

  // Get the channel
  const welcomeChannel = member.guild.channels.cache.get(
    config.welcomeChannelId
  );
  if (!welcomeChannel || !welcomeChannel.isTextBased()) return;

  // Create welcome message
  const welcomeMessage = mustache(config.welcomeMessage, {
    user: userMention(member.id),
  });

  // Create embed
  const embed = new EmbedBuilder()
    .setColor(config.welcomeColor as `#${string}`)
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setDescription(welcomeMessage)
    .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
    .setTimestamp()
    .setFooter({
      text: `Member #${member.guild.memberCount}`,
      iconURL: member.guild.iconURL() || undefined,
    });

  // Send welcome message
  await welcomeChannel.send({ embeds: [embed] });
});

export default event;
