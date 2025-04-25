# Discord Events Handling

This document explains how to handle Discord events in the Nemesis template.

## 🔄 Events Handling

Discord.js events are handled through the Event class and organized in the `src/events` directory:

```typescript
// src/events/messageCreate.ts
import { Event } from "../classes/event.js";

const event = new Event("messageCreate", (client, message) => {
  // Event handler implementation
});

export default event;
```

Events are automatically loaded from the `src/events` directory when the bot starts.

## Creating Event Handlers

The Event class takes two parameters:

1. The name of the Discord.js event to handle (e.g., "messageCreate", "guildMemberAdd")
2. A callback function that receives the client and any event-specific parameters

### Example: Guild Join Event

```typescript
// src/events/guildCreate.ts
import { Event } from "../classes/event.js";

const event = new Event("guildCreate", (client, guild) => {
  client.logger.info(`Bot joined a new guild: ${guild.name} (${guild.id})`);

  // You can perform additional setup when joining a new guild
  // For example, create default settings in the database
});

export default event;
```

### Example: Ready Event

```typescript
// src/events/ready.ts
import { Event } from "../classes/event.js";

const event = new Event("ready", (client) => {
  client.logger.info(`Logged in as ${client.user?.tag}`);
  client.logger.info(`Serving ${client.guilds.cache.size} guilds`);

  // You can perform initialization tasks here
  // For example, start scheduled tasks or update presence
  client.user?.setActivity("with discord.js", { type: "PLAYING" });
});

export default event;
```

### Example: Message Event

```typescript
// src/events/messageCreate.ts
import { Event } from "../classes/event.js";

const event = new Event("messageCreate", (client, message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Log messages for debugging
  client.logger.debug(
    `Message received: ${message.content} from ${message.author.tag}`
  );

  // Implement custom message handling logic
});

export default event;
```

## Event Best Practices

1. **Error Handling**: Always wrap event handlers in try/catch blocks to prevent crashes
2. **Performance**: Keep event handlers lightweight, especially for frequent events like messageCreate
3. **Logging**: Use appropriate log levels for different types of event information
4. **Modularization**: Split complex event logic into separate functions or services
