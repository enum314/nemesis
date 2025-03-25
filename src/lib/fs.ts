import fs from "fs/promises";
import path from "path";

export function makePath(paths: string[]) {
  return path.join(process.cwd(), ...paths);
}

export async function writeFile(
  paths: string[],
  buffer: string | NodeJS.ArrayBufferView
) {
  await fs.writeFile(makePath(paths), buffer);
}

export function readFile(paths: string[]) {
  return fs.readFile(makePath(paths));
}

export async function existsFile(paths: string[]) {
  try {
    return (await stat(paths)).isFile();
  } catch (_err) {
    return false;
  }
}

export function stat(paths: string[]) {
  return fs.stat(makePath(paths));
}

export function readdir(paths: string[]) {
  return fs.readdir(makePath(paths));
}

export async function mkdir(paths: string[]) {
  await fs.mkdir(makePath(paths), { recursive: true });
}

export async function existsDirectory(paths: string[]) {
  try {
    return (await stat(paths)).isDirectory();
  } catch (_err) {
    return false;
  }
}
