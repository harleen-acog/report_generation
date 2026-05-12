import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Detect if running inside website folder
 */
function getProjectRoot() {
  const cwd = process.cwd();

  // If running from website, go one level up
  if (cwd.includes(`${path.sep}website`)) {
    return path.resolve(cwd, "..");
  }

  return cwd;
}

/**
 * Stable project root (CLI + Astro safe)
 */
export const ROOT_DIR = getProjectRoot();

/**
 * Books source (markdown files)
 */
export const BOOKS_DIR = path.join(
  ROOT_DIR,
  "generated/books"
);

/**
 * Export output directory
 */
export const EXPORTS_DIR = path.join(
  ROOT_DIR,
  "exports"
);

/**
 * Temp working directory (marp slides)
 */
export const TEMP_DIR = path.join(
  ROOT_DIR,
  ".generated/tmp"
);

/**
 * Theme path for marp
 */
export const THEME_PATH = path.join(
  ROOT_DIR,
  "src/themes/book-theme.css"
);