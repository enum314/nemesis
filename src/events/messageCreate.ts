import { Event } from "#classes/event";

export default new Event("messageCreate")
  .parallel([
    () => ({ a: Math.floor(Math.random() * 100) }),
    () => ({ b: Math.floor(Math.random() * 100) }),
    () => ({ c: Math.floor(Math.random() * 100) }),
    () => ({ d: Math.floor(Math.random() * 100) }),
    () => ({ e: Math.floor(Math.random() * 100) }),
  ])
  .run(({ client, ...ctx }, message) => {
    // Log messages for demonstration
    client.logger.info(
      `Message received from ${message.author.tag}: ${message.content}`
    );

    client.logger.info(`Context: ${JSON.stringify(ctx, null, 2)}`);
  });
