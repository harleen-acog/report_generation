// export function getOpenLibraryCover(title: string) {
//   return `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-L.jpg`;
// }
const coverCache = new Map<string, string | null>();

export async function getOpenLibraryCover(
  title: string,
  author?: string
) {
  const key = `${title}-${author ?? ""}`;

  // cache hit
  if (coverCache.has(key)) {
    return coverCache.get(key);
  }

  try {
    const query = new URLSearchParams({
      title,
      ...(author ? { author } : {}),
    });

    const url = `https://openlibrary.org/search.json?${query.toString()}`;

    console.log("[OpenLibrary]", url);

    const res = await fetch(url);

    if (!res.ok) {
      coverCache.set(key, null);
      return null;
    }

    const data = await res.json();

    const coverId = data.docs?.[0]?.cover_i;

    if (!coverId) {
      coverCache.set(key, null);
      return null;
    }

    const cover = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;

    coverCache.set(key, cover);

    return cover;
  } catch (err) {
    console.error("[OpenLibrary Error]", err);

    coverCache.set(key, null);

    return null;
  }
}

