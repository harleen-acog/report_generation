import fs from "fs";
import path from "path";

import type { GeneratedBook } from "../domain/generated_book.js";
import { renderMarkdown } from "../renderers/markdown_render.js";

import {
  BOOKS_DIR,
  EXPORTS_DIR,
} from "../utils/paths.js";

export function generateMarkdownFile(
  book: GeneratedBook,
  exportPath?: string,
) {
  const markdown = renderMarkdown(book);

  // ---------------------------
  // Canonical storage (ALWAYS SAME PLACE)
  // ---------------------------

  fs.mkdirSync(BOOKS_DIR, { recursive: true });

  const canonicalFilePath = path.join(
    BOOKS_DIR,
    `${book.slug}.md`,
  );

  fs.writeFileSync(canonicalFilePath, markdown);

  // ---------------------------
  // Optional export copy
  // ---------------------------

  if (exportPath) {
    const exportDir = path.isAbsolute(exportPath)
      ? exportPath
      : path.join(EXPORTS_DIR, exportPath);

    fs.mkdirSync(exportDir, { recursive: true });

    const exportedFilePath = path.join(
      exportDir,
      `${book.slug}.md`,
    );

    fs.copyFileSync(canonicalFilePath, exportedFilePath);
  }

  return canonicalFilePath;
}