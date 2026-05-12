// import authorOverview from "../prompts/author_overview.prompt.md" with { type: "text" };
// import bookSummary from "../prompts/book_summary.prompt.md" with { type: "text" };
// import fullBookDetails from "../prompts/bookinfo_detailed.prompt.md" with { type: "text" };
// export const prompts = {
//   "author_overview.prompt.md": authorOverview,
//   "bookinfo_detailed.prompt.md":fullBookDetails,
//   "book_summary.prompt.md": bookSummary,
// } as const;

import { readFileSync } from "fs";
import path from "path";

function load(file: string) {
  return readFileSync(
    path.resolve(process.cwd(), "src/prompts", file),
    "utf-8"
  );
}

export const prompts = {
  "author_overview.prompt.md": load("author_overview.prompt.md"),
  "bookinfo_detailed.prompt.md": load("bookinfo_detailed.prompt.md"),
  "book_summary.prompt.md": load("book_summary.prompt.md"),
} as const;