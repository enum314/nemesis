import { z } from "zod";

import { Configuration } from "#classes/configuration";

// Create a configuration for welcome channel
const welcomeConfig = new Configuration({
  name: "welcome",
  type: "yaml",
  schema: z.strictObject({
    welcomeChannelId: z.string(),
    welcomeMessage: z.string(),
    welcomeColor: z.string(),
  }),
  defaults: {
    welcomeChannelId: "",
    welcomeMessage:
      "Welcome {{user}} to the server! We hope you enjoy your stay!",
    welcomeColor: "#00ff00",
  },
  addon: "welcomer",
});

export default welcomeConfig;
