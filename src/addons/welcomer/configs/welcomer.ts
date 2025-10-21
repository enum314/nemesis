import { z } from "zod";

import { Configuration } from "#classes/configuration";
import { color } from "#lib/colors";

export default new Configuration({
  addon: "welcomer",
  name: "config",
  type: "yaml",
  schema: z.object({
    welcomeChannelId: z.string(),
    welcomeMessage: z.string(),
    welcomeColor: color,
    welcomeImage: z.string(),
  }),
  defaults: {
    welcomeChannelId: "",
    welcomeMessage: "",
    welcomeColor: "Default",
    welcomeImage: "",
  },
});
