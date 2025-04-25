import { z } from "zod";

import { Configuration } from "#lib/configuration";

// Define schema for goodbye configuration
const goodbyeConfigSchema = z
  .object({
    goodbyeChannelId: z.string(),
    goodbyeMessage: z.string(),
    goodbyeColor: z.string(),
  })
  .strict();

// Type for the goodbye configuration
type GoodbyeConfig = z.infer<typeof goodbyeConfigSchema>;

// Create a configuration for goodbye channel
const goodbyeConfig = new Configuration<GoodbyeConfig>({
  name: "goodbye",
  type: "yaml",
  schema: goodbyeConfigSchema,
  defaults: {
    goodbyeChannelId: "",
    goodbyeMessage: "Goodbye {user}! We hope to see you again soon!",
    goodbyeColor: "#ff0000",
  },
  addon: "welcomer",
});

export default goodbyeConfig;
