import { deepStrictEqual } from "assert";
import yaml from "yaml";
import type { z } from "zod";

import { merge } from "../utils/merge.js";
import {
  existsDirectory,
  existsFile,
  mkdir,
  readFile,
  writeFile,
} from "./fs.js";
import { Logger } from "./logger.js";

export class Configuration<ConfigurationStructure> {
  private cache!: ConfigurationStructure;

  public constructor(
    public readonly data: {
      name: string;
      type: "json" | "yaml";
      schema: z.ZodObject<
        any,
        "strict",
        z.ZodTypeAny,
        ConfigurationStructure,
        ConfigurationStructure
      >;
      defaults: ConfigurationStructure;
      addon?: string;
    }
  ) {}

  public async load() {
    const data = await this._load();

    if (!data) return;

    this.cache = data;
  }

  public async get() {
    if (!this.cache) {
      await this.load();
    }

    return this.cache;
  }

  public async update(partial: Partial<ConfigurationStructure>) {
    const response = this.data.schema.safeParse(partial);

    if (!response.success) {
      return { data: null, error: response.error };
    }

    const current = await this.get();

    const data = merge(
      merge(
        this.data.defaults as Record<string, unknown>,
        current as Record<string, unknown>
      ),
      partial,
      {
        clone: true,
      }
    ) as ConfigurationStructure;

    const fileExtension = this.data.type === "json" ? "json" : "yml";
    const fileName = `${this.data.name}.${fileExtension}`;

    const configPath = [
      "configs",
      ...(this.data.addon ? [this.data.addon, fileName] : [fileName]),
    ];

    await writeFile(
      configPath,
      this.data.type === "json"
        ? JSON.stringify(data, null, 2)
        : yaml.stringify(data)
    );

    this.cache = data;

    return { data, error: null };
  }

  private async _load() {
    const fileExtension = this.data.type === "json" ? "json" : "yml";
    const fileName = `${this.data.name}.${fileExtension}`;

    const configPath = [
      "configs",
      ...(this.data.addon ? [this.data.addon, fileName] : [fileName]),
    ];

    if (
      this.data.addon &&
      !(await existsDirectory(["configs", this.data.addon]))
    ) {
      await mkdir(["configs", this.data.addon]);
    }

    if (await existsFile(configPath)) {
      try {
        const buffer = await readFile(configPath);

        const fileData =
          this.data.type === "json"
            ? JSON.parse(buffer.toString())
            : yaml.parse(buffer.toString());

        const response = this.data.schema.safeParse(
          merge(this.data.defaults as Record<string, unknown>, fileData, {
            clone: true,
          })
        );

        if (!response.success) {
          throw response.error;
        }

        try {
          deepStrictEqual(response.data, fileData);
        } catch (_err) {
          // Only update if there are real differences that need to be written back
          // This prevents unnecessary overwrites
          const stringifiedOriginal = JSON.stringify(fileData);
          const stringifiedNew = JSON.stringify(response.data);

          if (stringifiedOriginal !== stringifiedNew) {
            await this.update(response.data);
          }
        }

        return response.data;
      } catch (err) {
        Logger.error(
          `[Config (${this.data.name}.${fileExtension})] Error loading config file`
        ).error(err);
      }

      return null;
    }

    await writeFile(
      configPath,
      this.data.type === "json"
        ? JSON.stringify(this.data.defaults, null, 2)
        : yaml.stringify(this.data.defaults)
    );

    return this.data.defaults;
  }
}

/**
 * Example Usage:
 *
 * ```typescript
 * import { z } from "zod";
 * import { Configuration } from "./configuration.js";
 *
 * // Define your configuration schema using Zod
 * const appConfigSchema = z.object({
 *   appName: z.string(),
 *   version: z.string(),
 *   port: z.number().int().positive(),
 *   features: z.object({
 *     enableLogging: z.boolean(),
 *     maxLogSize: z.number().positive().optional()
 *   }),
 *   apiKeys: z.record(z.string())
 * });
 *
 * // Define the type from your schema
 * type AppConfig = z.infer<typeof appConfigSchema>;
 *
 * // Create default configuration values
 * const defaultConfig: AppConfig = {
 *   appName: "MyApplication",
 *   version: "1.0.0",
 *   port: 3000,
 *   features: {
 *     enableLogging: true
 *   },
 *   apiKeys: {}
 * };
 *
 * // Initialize your configuration
 * const appConfig = new Configuration<AppConfig>({
 *   name: "app-config",  // Will create/use "configs/app-config.json" or "configs/app-config.yml"
 *   type: "json",        // Use "json" or "yaml"
 *   schema: appConfigSchema,
 *   defaults: defaultConfig
 * });
 *
 * // Initialize in your app's startup
 * async function initializeApp() {
 *   await appConfig.load();
 *
 *   // Retrieve the config
 *   const config = await appConfig.get();
 *   console.log(`Starting ${config.appName} v${config.version} on port ${config.port}`);
 *
 *   // Update a configuration value
 *   await appConfig.update({
 *     features: {
 *       enableLogging: false
 *     }
 *   });
 * }
 * ```
 */
