import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    DISCORD_TOKEN: z.string(),
    DISCORD_GUILD_ID: z.string().optional(),

    DATABASE_URL: z.string().url(),

    DISCORD_SHARDING: z
      .string()
      .refine((s) => s === "true" || s === "false")
      .transform((s) => s === "true"),
    DISCORD_SHARDS: z.union([z.literal("auto"), z.coerce.number().min(1)]),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
