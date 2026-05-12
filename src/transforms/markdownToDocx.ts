import fs from "fs/promises";
import matter from "gray-matter";
import {
  Paragraph,
  TextRun,
} from "docx";

/**
 * Stable heading mapping (avoids docx enum issues in Bun/TSX)
 */
const Heading = {
  h1: "Heading1",
  h2: "Heading2",
  title: "Title",
} as const;

function createParagraph(text: string) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 24,
      }),
    ],
    spacing: {
      after: 240,
      line: 360,
    },
  });
}

function createHeading(
  text: string,
  level: "h1" | "h2"
) {
  return new Paragraph({
    text,
    heading:
      level === "h1"
        ? Heading.h1
        : Heading.h2,
    spacing: {
      before: 240,
      after: 160,
    },
  });
}

function createBullet(text: string) {
  return new Paragraph({
    text,
    bullet: {
      level: 0,
    },
    spacing: {
      after: 120,
    },
  });
}

export async function markdownToDocx(
  filePath: string
) {
  const raw = await fs.readFile(
    filePath,
    "utf-8"
  );

  const { data, content } = matter(raw);

  const lines = content.split("\n");

  const elements: Paragraph[] = [];

  // -----------------------------------
  // TITLE
  // -----------------------------------

  elements.push(
    new Paragraph({
      text: data.title,
      heading: Heading.title,
      spacing: { after: 300 },
    })
  );

  elements.push(
    createParagraph(
      `By ${data.author}`
    )
  );

  // -----------------------------------
  // CONTENT
  // -----------------------------------

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;

    // H1
    if (trimmed.startsWith("# ")) {
      elements.push(
        createHeading(
          trimmed.replace("# ", ""),
          "h1"
        )
      );
      continue;
    }

    // H2
    if (trimmed.startsWith("## ")) {
      elements.push(
        createHeading(
          trimmed.replace("## ", ""),
          "h2"
        )
      );
      continue;
    }

    // Bullet
    if (trimmed.startsWith("- ")) {
      elements.push(
        createBullet(
          trimmed.replace("- ", "")
        )
      );
      continue;
    }

    // Quote
    if (trimmed.startsWith("> ")) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace(
                "> ",
                ""
              ),
              italics: true,
            }),
          ],
          indent: { left: 600 },
          spacing: { after: 240 },
        })
      );
      continue;
    }

    // Normal paragraph
    elements.push(
      createParagraph(trimmed)
    );
  }

  return elements;
}