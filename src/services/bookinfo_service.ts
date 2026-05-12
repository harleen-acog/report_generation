import { createLLMClient } from "../llm/provider_factory.js";
import { loadPrompt, fillTemplate } from "./prompt_loader.js";
import { generatedBookSchema } from "../schemas/full_book.js";
import { GeneratedBook } from "../domain/generated_book.js";

export async function getBookInfoDetail(input: {
  title: string;
  author: string;
  description?: string;
  style: string;
  depth?: string;
}) :Promise<GeneratedBook> {
  const client = createLLMClient();

  const template = loadPrompt("bookinfo_detailed.prompt.md");

  const prompt = fillTemplate(template, {
    TITLE: input.title,
    AUTHOR: input.author,
    DESCRIPTION: input.description || "No description available",
    DEPTH:input.depth || "medium",
    STYLE: input.style
  });

const result:GeneratedBook = await client.generateObject(
  prompt,
  generatedBookSchema
);

return {
  slug: input.title
    .toLowerCase()
    .replace(/\s+/g, "-"),

  title: result.title,

  author: result.author,

  summary: result.summary,

  themes: result.themes,

  keyPoints: result.keyPoints,

  relatedBooks: result.relatedBooks,

  genres: result.genres,

  generatedAt: new Date().toISOString(),
};
}