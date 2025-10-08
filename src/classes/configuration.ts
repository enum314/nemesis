import { deepEqual } from "fast-equals";
import yaml from "yaml";
import type { z } from "zod";

import {
  existsDirectory,
  existsFile,
  mkdir,
  readFile,
  writeFile,
} from "#lib/fs";
import { Logger } from "#lib/logger";
import { merge } from "#utils/merge";

export class Configuration<
  ConfigurationSchema extends z.ZodObject<{}, z.core.$strict>,
> {
  private cache!: z.core.output<ConfigurationSchema>;

  public constructor(
    public readonly data: {
      name: string;
      type: "json" | "yaml";
      schema: ConfigurationSchema;
      defaults: z.infer<ConfigurationSchema>;
      addon?: string;
    }
  ) {}

  public async load() {
    const data = await this._load();

    if (!data) return;

    this.cache = data;
  }

  public async get() {
    if (!this.cache) await this.load();

    return this.cache ?? this.data.defaults;
  }

  public async update(partial: Partial<z.core.output<ConfigurationSchema>>) {
    const response = this.data.schema.safeParse(partial);

    if (!response.success) {
      return { data: null, error: response.error };
    }

    const current = await this.get();

    const data = merge(merge(this.data.defaults, current), partial, {
      clone: true,
    }) as z.core.output<ConfigurationSchema>;

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

  private async _load(): Promise<z.core.output<ConfigurationSchema> | null> {
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
          merge(this.data.defaults, fileData, {
            clone: true,
          })
        );

        if (!response.success) {
          throw response.error;
        }

        if (!deepEqual(response.data, fileData)) {
          this.cache = response.data;

          await this.update(response.data);
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
