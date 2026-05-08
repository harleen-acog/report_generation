import type { OpenLibraryDoc } from "./openlibrary_client.js";
import type { Book } from "../domain/book.js";

export function normalizeBooks(
  docs: OpenLibraryDoc[],
  targetAuthor: string,
): Book[] {
  return docs.filter((doc) => isValidDoc(doc, targetAuthor)).map(mapToBook);
}

function isValidDoc(doc: OpenLibraryDoc, targetAuthor: string): boolean {
  if (!doc.title) return false;
  if (!doc.author_name?.length) return false;

  const matchesAuthor = doc.author_name.some(
    (name) => name.toLowerCase() === targetAuthor.toLowerCase(),
  );

  if (!matchesAuthor) return false;

  const badKeywords = [
    "prentice hall",
    "literature",
    "grade",
    "level",
    "edition",
    "anthology",
    "collection",
    "textbook",
  ];

  const title = doc.title.toLowerCase();

  if (badKeywords.some((word) => title.includes(word))) {
    return false;
  }

  return true;
}

export function mapToBook(doc: OpenLibraryDoc): Book {
  return {
    id: doc.key.replace("/works/", ""), // clean ID for routing

    title: doc.title ?? "Unknown Title",

    author: doc.author_name?.[0] ?? "Unknown",

    editionCount: doc.edition_count ?? 0,

    subjects: doc.subject ?? [],

    coverImage: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : undefined,

    firstPublishYear: doc.first_publish_year
  };
}

function cleanTitle(title: string): string {
  return title.replace(/\s+/g, " ").replace(/\/.*$/, "").trim();
}
