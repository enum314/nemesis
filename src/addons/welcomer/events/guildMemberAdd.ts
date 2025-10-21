import path from "path";
import { AttachmentBuilder, EmbedBuilder, userMention } from "discord.js";

import welcomeConfig from "#addons/welcomer/configs/welcomer";
import { Event } from "#classes/event";
import { mustache } from "#utils/mustache";

export default new Event("guildMemberAdd").run(async ({}, member) => {
  // Get the configuration
  const config = await welcomeConfig.get();

  // If channel is not set, do nothing
  if (!config.welcomeChannelId) return;

  // Get the channel
  const welcomeChannel = member.guild.channels.cache.get(
    config.welcomeChannelId
  );

  if (!welcomeChannel || !welcomeChannel.isSendable()) return;

  // Create welcome message
  const welcomeMessage = mustache(config.welcomeMessage, {
    user: userMention(member.id),
  });

  const file = config.welcomeImage
    ? new AttachmentBuilder(
        path.join(process.cwd(), "assets", config.welcomeImage)
      )
    : null;

  // Create embed
  const embed = new EmbedBuilder()
    .setColor(config.welcomeColor)
    .setTitle(`Welcome ${member.user.username}!`)
    .setDescription(welcomeMessage)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  if (config.welcomeImage) {
    embed.setImage(`attachment://${config.welcomeImage}`);
  }

  // Send welcome message
  await welcomeChannel.send({
    content: userMention(member.id),
    embeds: [embed],
    ...(file
      ? {
          files: [file],
        }
      : {}),
  });
});
