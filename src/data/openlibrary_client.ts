export type OpenLibraryDoc = {
  title?: string;
  author_name?: string[];
  edition_count?: number;
  key: string;
  subject?: string[];
  cover_i?: number;
  first_publish_year?: number;
};
export async function searchByAuthor(author: string) {
  const url = `https://openlibrary.org/search.json?author=${encodeURIComponent(author)}&limit=40`;

  const res = await fetch(url);

  //add no results found handling 
  if (!res.ok) {
    throw new Error("Failed to fetch from Open Library");
  }

  const data = await res.json();
  return data.docs;
}