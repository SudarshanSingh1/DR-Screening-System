import fs from 'fs';
import path from 'path';

// Local storage base path inside the container/filesystem
const STORAGE_BASE_PATH = process.env.STORAGE_BASE_PATH || path.join(process.cwd(), 'uploads');

// Ensure base directory exists
if (!fs.existsSync(STORAGE_BASE_PATH)) {
  fs.mkdirSync(STORAGE_BASE_PATH, { recursive: true });
}

/**
 * Save a file to the configured storage medium.
 * @param sourceFilePath Path to the temporary file to be moved
 * @param destinationKey Key (e.g. 'images/uuid.jpg') under which to store the file
 */
export async function saveFile(sourceFilePath: string, destinationKey: string): Promise<string> {
  const destPath = path.join(STORAGE_BASE_PATH, destinationKey);
  const dir = path.dirname(destPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Copy instead of rename to prevent issues across different mount points
  fs.copyFileSync(sourceFilePath, destPath);
  
  return destinationKey;
}

/**
 * Retrieve a file's read stream or buffer from storage.
 * @param storageKey The key returned during saveFile
 */
export function getFilePath(storageKey: string): string {
  return path.join(STORAGE_BASE_PATH, storageKey);
}

export function deleteFile(storageKey: string): void {
  const destPath = path.join(STORAGE_BASE_PATH, storageKey);
  if (fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  }
}
