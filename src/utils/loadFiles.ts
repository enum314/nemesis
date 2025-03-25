import { readdirSync } from "fs";
import path from "path";

/**
 * Recursively get all files from a directory
 * @param dirPath Directory path to search
 * @returns Array of file paths
 */
export function getAllFiles(dirPath: string): string[] {
  const fullPath = path.join(process.cwd(), "dist", dirPath);

  const files: string[] = [];

  // Read all files/folders in directory
  readdirSync(fullPath, { withFileTypes: true }).forEach((dirent) => {
    if (dirent.isDirectory()) {
      // Recursively get files from subdirectories
      files.push(...getAllFiles(path.join(dirPath, dirent.name)));
    } else if (dirent.isFile() && dirent.name.endsWith(".js")) {
      // Only include .js and .ts files
      files.push(path.join(dirPath, dirent.name));
    }
  });

  return files;
}
