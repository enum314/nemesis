import { existsSync } from "fs";
import { readdir } from "fs/promises";
import path from "path";

/**
 * Recursively get all files from a directory
 * @param dirPath Directory path to search
 * @returns Promise resolving to array of file paths
 */
export async function getAllFiles(dirPath: string[]): Promise<string[]> {
  const fullPath = path.join(process.cwd(), "dist", ...dirPath);

  // Check if the path exists to avoid throwing errors
  if (!existsSync(fullPath)) {
    return [];
  }

  const files: string[] = [];

  try {
    // Read all files/folders in directory
    const dirents = await readdir(fullPath, { withFileTypes: true });

    // Process each directory entry
    for (const dirent of dirents) {
      if (dirent.isDirectory()) {
        // Recursively get files from subdirectories
        const subFiles = await getAllFiles([
          path.join(...dirPath, dirent.name),
        ]);
        files.push(...subFiles);
      } else if (dirent.isFile() && dirent.name.endsWith(".js")) {
        // Only include .js
        files.push(path.join(...dirPath, dirent.name));
      }
    }

    return files;
  } catch (error) {
    // Log error but don't throw, return empty array instead
    console.error(`Error reading directory ${fullPath}:`, error);
    return [];
  }
}
