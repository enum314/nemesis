import { Event } from "#classes/event";

const event = new Event("messageCreate", (client, message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Log messages for demonstration
  client.logger.info(
    `Message received from ${message.author.tag}: ${message.content}`
  );
});

export default event;
