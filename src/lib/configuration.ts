import { deepStrictEqual } from "assert";
import yaml from "yaml";
import type { z } from "zod";

import { merge } from "../utils/merge.js";
import { existsFile, readFile, writeFile } from "./fs.js";
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

    const current = this.get();

    const data = merge(merge(this.data.defaults, current), partial, {
      clone: true,
    }) as ConfigurationStructure;

    await writeFile(
      [
        "configs",
        `${this.data.name}.${this.data.type === "json" ? "json" : "yml"}`,
      ],
      this.data.type === "json"
        ? JSON.stringify(data, null, 2)
        : yaml.stringify(data)
    );

    this.cache = data;

    return { data, error: null };
  }

  private async _load() {
    if (await existsFile(["configs", `${this.data.name}.yml`])) {
      try {
        const buffer = await readFile([
          "configs",
          `${this.data.name}.${this.data.type === "json" ? "json" : "yml"}`,
        ]);

        const data =
          this.data.type === "json"
            ? JSON.parse(buffer.toString())
            : yaml.parse(buffer.toString());

        const response = this.data.schema.safeParse(
          merge(this.data.defaults, data, { clone: true })
        );

        if (!response.success) {
          throw response.error;
        }

        try {
          deepStrictEqual(response.data, data);
        } catch (err) {
          await this.update(response.data);
        }

        return response.data;
      } catch (err) {
        Logger.error(
          `[Config (${this.data.name}.${
            this.data.type === "json" ? "json" : "yml"
          })] Error loading config file`
        ).error(err);
      }

      return null;
    }

    await writeFile(
      [
        "configs",
        `${this.data.name}.${this.data.type === "json" ? "json" : "yml"}`,
      ],
      this.data.type === "json"
        ? JSON.stringify(this.data.defaults, null, 2)
        : yaml.stringify(this.data.defaults)
    );

    return this.data.defaults;
  }
}
