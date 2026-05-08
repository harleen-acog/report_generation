import type { Book } from "../domain/book.js";

export function selectTopBooks(books: Book[]): Book[] {
  const unique = new Map<string, Book>();

  for (const book of books) {
    const key = book.title.toLowerCase();
    if (!unique.has(key)) unique.set(key, book);
  }

  return Array.from(unique.values())
    .sort((a, b) => b.editionCount - a.editionCount)
    .slice(0, 10);
}