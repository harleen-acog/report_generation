import { searchByAuthor } from "../data/openlibrary_client.js";
import { normalizeBooks } from "../data/normalize.js"; //
import { selectTopBooks } from "./book_selector.js";
import { loadPrompt, fillTemplate } from "./prompt_loader.js";
import { createLLMClient } from "../llm/provider_factory.js";
import { z } from "zod";
import type { AuthorOverview } from "../domain/author.js";

export async function getAuthorOverview(author: string): Promise<AuthorOverview>{
  let docs = await searchByAuthor(author);

  if (docs.length === 0) {
    const fallback = author.split(" ").pop(); 
    docs = await searchByAuthor(fallback!);
  }

  if (docs.length === 0) {
    return {
      author_summary: `No results found for "${author}".`,
      books: [],
    };
  }

  const normalizedBooks = normalizeBooks(docs, author);

  const books = selectTopBooks(normalizedBooks);

  const client = createLLMClient();

  const promptTemplate = loadPrompt("author_overview.prompt.md");

  const prompt = fillTemplate(promptTemplate, {
    BOOKS_DATA: JSON.stringify(books, null, 2),
  });

  const schema = z.object({
    author_summary: z.string(),
    books: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    ),
  });

  return client.generateObject(prompt, schema);
}
