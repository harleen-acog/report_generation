import fs from "fs/promises";
import path from "path";
import { BOOKS_DIR } from "./paths.js";

function normalizeTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function resolveBook(title: string) {
  const files = await fs.readdir(BOOKS_DIR);

  const normalizedInput = normalizeTitle(title);

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const filename = file.replace(/\.md$/, "");

    if (normalizeTitle(filename) === normalizedInput) {
      return path.join(BOOKS_DIR, file);
    }
  }

  throw new Error(`Book not found: ${title}`);
}