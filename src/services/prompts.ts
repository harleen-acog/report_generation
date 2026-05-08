import authorOverview from "../prompts/author_overview.prompt.md" with { type: "text" };
import bookSummary from "../prompts/book_summary.prompt.md" with { type: "text" };

export const prompts = {
  "author_overview.prompt.md": authorOverview,
  "book_summary.prompt.md": bookSummary,
} as const;