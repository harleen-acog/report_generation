import type {
  GeneratedBook,
} from "../domain/generated_book.js";

export function renderMarkdown(
  book: GeneratedBook,
): string {

  const themes = book.themes
    .map(theme => `- ${theme}`)
    .join("\n");

  const keyPoints = book.keyPoints
    .map(point => `- ${point}`)
    .join("\n");


  const genres = book.genres?.length
    ? `[${book.genres
        .map(g => `"${g}"`)
        .join(", ")}]`
    : "[]";

const relatedBooks = book.relatedBooks?.length
    ? `[${book.relatedBooks
        .map(g => `"${g}"`)
        .join(", ")}]`
    : "[]";



  return `---
title: "${book.title}"
author: "${book.author}"
slug: "${book.slug}"
generatedAt: "${book.generatedAt}"
themes: [${book.themes
  .map(t => `"${t}"`)
  .join(", ")}]
genres: ${genres}
relatedBooks: ${relatedBooks}
---
## Summary

${book.summary}


## Key Points

${keyPoints}

`;
}