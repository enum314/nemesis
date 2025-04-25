import { z } from "zod";

import { Configuration } from "../../../lib/configuration.js";

// Define schema for welcome configuration
const welcomeConfigSchema = z
  .object({
    welcomeChannelId: z.string(),
    welcomeMessage: z.string(),
    welcomeColor: z.string(),
  })
  .strict();

// Type for the welcome configuration
type WelcomeConfig = z.infer<typeof welcomeConfigSchema>;

// Create a configuration for welcome channel
const welcomeConfig = new Configuration<WelcomeConfig>({
  name: "welcome",
  type: "yaml",
  schema: welcomeConfigSchema,
  defaults: {
    welcomeChannelId: "",
    welcomeMessage:
      "Welcome {{user}} to the server! We hope you enjoy your stay!",
    welcomeColor: "#00ff00",
  },
  addon: "welcomer",
});

export default welcomeConfig;
