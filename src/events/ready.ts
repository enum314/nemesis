import { Event } from "../classes/event.js";
import { setCurrentShardId } from "../lib/logger.js";

const event = new Event(
  "ready",
  async (client) => {
    client.logger.info(`Logged in as ${client.user.tag}`);

    // If the client is sharded, set the shard ID for logging
    if (client.shard) {
      const shardId = client.shard.ids[0]; // Get the shard ID (assuming one per process)
      setCurrentShardId(shardId);
      client.logger.info(`Running as shard ${shardId}`);
    }
  },
  true
); // Set to run once when the bot becomes ready

export default event;
