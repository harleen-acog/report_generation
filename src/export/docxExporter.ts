// import fs from "fs/promises";
// import path from "path";

// import {
//   Document,
//   Packer,
// } from "docx";

// import { markdownToDocx } from "../transforms/markdownToDocx.js";
// import { resolveBook} from "../utils/resolveBook.js";
// import { EXPORTS_DIR } from "../utils/paths.js";

// // function normalizeTitle(
// //   title: string
// // ) {
// //   return title
// //     .trim()
// //     .toLowerCase()
// //     .replace(/[^a-z0-9]/g, "");
// // }

// // async function resolveBook(
// //   title: string
// // ) {
// //   const booksDir = path.resolve(
// //     process.cwd(),
// //     "generated/books"
// //   );

// //   const files = await fs.readdir(
// //     booksDir
// //   );

// //   const normalizedInput =
// //     normalizeTitle(title);

// //   for (const file of files) {
// //     if (!file.endsWith(".md")) {
// //       continue;
// //     }

// //     const filename = file.replace(
// //       /\.md$/,
// //       ""
// //     );

// //     if (
// //       normalizeTitle(filename) ===
// //       normalizedInput
// //     ) {
// //       return path.join(
// //         booksDir,
// //         file
// //       );
// //     }
// //   }

// //   throw new Error(
// //     `Book not found: ${title}`
// //   );
// // }

// export async function exportOldDocx({
//   title,
//   output,
// }: {
//   title: string;
//   output?: string;
// }) {
//   const filePath =
//     await resolveBook(title);

//   const elements =
//     await markdownToDocx(
//       filePath
//     );

//   const doc =
//     new Document({
//       sections: [
//         {
//           properties: {},

//           children: elements,
//         },
//       ],
//     });

//   const buffer =
//     await Packer.toBuffer(doc);

//   const outputDir = output
//     ? path.resolve(
//         process.cwd(),
//         output
//       )
//     : path.resolve(
//         process.cwd(),
//         "exports"
//       );

//   await fs.mkdir(outputDir, {
//     recursive: true,
//   });

//   const safeTitle = title
//     .toLowerCase()
//     .replace(/\s+/g, "-");

//   const outputPath =
//     path.join(
//       outputDir,
//       `${safeTitle}.docx`
//     );

//   await fs.writeFile(
//     outputPath,
//     buffer
//   );

//   console.log(`
// DOCX exported:

// ${outputPath}
// `);
// return outputPath;
// }



// export async function exportDocx({
//   title,
//   output,
// }: {
//   title: string;
//   output?: string;
// }) {
//   // -----------------------------
//   // Resolve markdown book
//   // -----------------------------
//   const filePath = await resolveBook(title);

//   // -----------------------------
//   // Convert markdown → docx elements
//   // -----------------------------
//   const elements = await markdownToDocx(filePath);

//   const doc = new Document({
//     sections: [
//       {
//         properties: {},
//         children: elements,
//       },
//     ],
//   });

//   const buffer = await Packer.toBuffer(doc);

//   // -----------------------------
//   // Output directory
//   // -----------------------------
//   const outputDir = output
//     ? path.resolve(process.cwd(), output)
//     : EXPORTS_DIR;

//   await fs.mkdir(outputDir, { recursive: true });

//   const safeTitle = title.toLowerCase().replace(/\s+/g, "-");

//   const outputPath = path.join(outputDir, `${safeTitle}.docx`);

//   await fs.writeFile(outputPath, buffer);

//   console.log(`DOCX exported:\n${outputPath}`);

//   return outputPath;
// }

import fs from "fs/promises";
import path from "path";

import {
  Document,
  Packer,
} from "docx";

import { markdownToDocx } from "../transforms/markdownToDocx.js";
import { resolveBook } from "../utils/resolveBook.js";
import { EXPORTS_DIR } from "../utils/paths.js";

export async function exportDocx({
  title,
  output,
}: {
  title: string;
  output?: string;
}) {
  // -----------------------------
  // Resolve markdown book
  // -----------------------------
  const filePath = await resolveBook(title);

  // -----------------------------
  // Convert markdown → docx
  // -----------------------------
  const elements = await markdownToDocx(filePath);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: elements,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  // -----------------------------
  // Output directory (FIXED)
  // -----------------------------
  const outputDir = output
    ? path.isAbsolute(output)
      ? output
      : path.join(EXPORTS_DIR, output)
    : EXPORTS_DIR;

  await fs.mkdir(outputDir, { recursive: true });

  const safeTitle = title.toLowerCase().replace(/\s+/g, "-");

  const outputPath = path.join(outputDir, `${safeTitle}.docx`);

  await fs.writeFile(outputPath, buffer);

  console.log(`DOCX exported:\n${outputPath}`);

  return outputPath;
}