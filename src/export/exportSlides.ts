// import fs from "fs/promises";
// import path from "path";
// import { execSync } from "child_process";

// import { markdownToSlides } from "../transforms/markdownToSlides.js";
// import { resolveBook } from "../utils/resolveBook.js";
// import { EXPORTS_DIR, TEMP_DIR, THEME_PATH } from "../utils/paths.js";

// type ExportFormat = "pptx" | "pdf" | "html";

// export async function exportSlides({
//   title,
//   format,
//   output,
// }: {
//   title: string;
//   format: ExportFormat;
//   output?: string;
// }) {
//   // -----------------------------
//   // Resolve book
//   // -----------------------------
//   const bookPath = await resolveBook(title);

//   // -----------------------------
//   // Generate slides markdown
//   // -----------------------------
//   const slides = await markdownToSlides(bookPath);

//   await fs.mkdir(TEMP_DIR, { recursive: true });

//   // -----------------------------
//   // Output directory (FIXED)
//   // -----------------------------
//   const outputDir = output
//     ? path.isAbsolute(output)
//       ? output
//       : path.join(EXPORTS_DIR, output)
//     : EXPORTS_DIR;

//   await fs.mkdir(outputDir, { recursive: true });

//   const safeTitle = title.toLowerCase().replace(/\s+/g, "-");

//   const tempSlidePath = path.join(
//     TEMP_DIR,
//     `${safeTitle}.slides.md`
//   );

//   const outputPath = path.join(
//     outputDir,
//     `${safeTitle}.${format}`
//   );

//   // -----------------------------
//   // Write temp file
//   // -----------------------------
//   await fs.writeFile(tempSlidePath, slides);

//   // -----------------------------
//   // Marp command
//   // -----------------------------
//   const marpFlag =
//     format === "pptx"
//       ? "--pptx"
//       : format === "pdf"
//       ? "--pdf"
//       : "--html";

//   const command =
//     `marp "${tempSlidePath}" ` +
//     `${marpFlag} ` +
//     `--theme-set "${THEME_PATH}" ` +
//     `-o "${outputPath}"`;

//   execSync(command, { stdio: "inherit" });

//   console.log(`Exported:\n${outputPath}`);

//   return outputPath;
// }