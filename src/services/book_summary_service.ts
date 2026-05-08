import { createLLMClient } from "../llm/provider_factory.js";
import { loadPrompt, fillTemplate } from "./prompt_loader.js";

export async function getBookSummary(input: {
  title: string;
  author: string;
  description?: string;
  style: string;
  depth?: string;
}) {
  const client = createLLMClient();

  const template = loadPrompt("book_summary.prompt.md");

  const prompt = fillTemplate(template, {
    TITLE: input.title,
    AUTHOR: input.author,
    DESCRIPTION: input.description || "No description available",
    DEPTH:input.depth || "medium",
    STYLE: input.style
  });

  return client.generateText(prompt);
}