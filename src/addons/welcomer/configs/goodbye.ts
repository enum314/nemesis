import { z } from "zod";

import { Configuration } from "#classes/configuration";

// Create a configuration for goodbye channel
const goodbyeConfig = new Configuration({
  name: "goodbye",
  type: "yaml",
  schema: z.strictObject({
    goodbyeChannelId: z.string(),
    goodbyeMessage: z.string(),
    goodbyeColor: z.string(),
  }),
  defaults: {
    goodbyeChannelId: "",
    goodbyeMessage: "Goodbye {user}! We hope to see you again soon!",
    goodbyeColor: "#ff0000",
  },
  addon: "welcomer",
});

export default goodbyeConfig;
