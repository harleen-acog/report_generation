import fs from "fs/promises";
import matter from "gray-matter";

function chunkArray<T>(
  arr: T[],
  size: number
): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }

  return chunks;
}

function splitParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function isBulletSection(text: string) {
  return text
    .split("\n")
    .some((line) => line.trim().startsWith("- "));
}

function extractBullets(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "));
}

export async function markdownToSlides(
  filePath: string
) {
  const raw = await fs.readFile(
    filePath,
    "utf-8"
  );

  const { data, content } = matter(raw);

  const sections = content
    .split(/^## /gm)
    .filter(Boolean);

  let slides = `---
marp: true
theme: book-theme
paginate: true
---

`;

  // -----------------------------------
  // TITLE SLIDE
  // -----------------------------------

  slides += `# ${data.title}

${data.author}

---

`;

  // -----------------------------------
  // GENRES
  // -----------------------------------

  if (data.genres?.length) {
    const chunks = chunkArray(
      data.genres,
      5
    );

    chunks.forEach((chunk, index) => {
      slides += `# Genres`;

      if (chunks.length > 1) {
        slides += ` (${index + 1}/${chunks.length})`;
      }

      slides += `

`;

      chunk.forEach((genre) => {
        slides += `- ${genre}\n`;
      });

      slides += `

---

`;
    });
  }

  // -----------------------------------
  // THEMES
  // -----------------------------------

  if (data.themes?.length) {
    const chunks = chunkArray(
      data.themes,
      5
    );

    chunks.forEach((chunk, index) => {
      slides += `# Themes`;

      if (chunks.length > 1) {
        slides += ` (${index + 1}/${chunks.length})`;
      }

      slides += `

`;

      chunk.forEach((theme) => {
        slides += `- ${theme}\n`;
      });

      slides += `

---

`;
    });
  }

  // -----------------------------------
  // CONTENT SECTIONS
  // -----------------------------------

  for (const section of sections) {
    const lines = section
      .trim()
      .split("\n");

    const heading = lines[0]?.trim();

    const body = lines
      .slice(1)
      .join("\n")
      .trim();

    // -------------------------------
    // BULLET-BASED SECTION
    // -------------------------------

    if (isBulletSection(body)) {
      const bullets = extractBullets(body);

      const chunks = chunkArray(
        bullets,
        5
      );

      chunks.forEach((chunk, index) => {
        slides += `# ${heading}`;

        if (chunks.length > 1) {
          slides += ` (${index + 1}/${chunks.length})`;
        }

        slides += `

`;

        chunk.forEach((bullet) => {
          slides += `${bullet}\n`;
        });

        slides += `

---

`;
      });

      continue;
    }

    // -------------------------------
    // PARAGRAPH-BASED SECTION
    // -------------------------------

    const paragraphs =
      splitParagraphs(body);

    paragraphs.forEach(
      (paragraph, index) => {
        slides += `# ${heading}`;

        if (paragraphs.length > 1) {
          slides += ` (${index + 1}/${paragraphs.length})`;
        }

        slides += `

${paragraph}

---

`;
      }
    );
  }

  // -----------------------------------
  // RELATED BOOKS
  // -----------------------------------

  if (data.relatedBooks?.length) {
    const chunks = chunkArray(
      data.relatedBooks,
      5
    );

    chunks.forEach((chunk, index) => {
      slides += `# Related Reading`;

      if (chunks.length > 1) {
        slides += ` (${index + 1}/${chunks.length})`;
      }

      slides += `

`;

      chunk.forEach((book) => {
        slides += `- ${book}\n`;
      });

      slides += `


`;
    });
  }

  return slides;
}