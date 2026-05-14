

// import fs from "fs"
// import path from "path"
// import { execSync } from "child_process"

// // ─────────────────────────────────────────────
// // MAIN PPTX RENDERER (Marp CLI)
// // Theme: templates/aganitha.css (copied next to marp input for portability)
// // cwd is set to outputDir so relative image paths resolve correctly.
// // ─────────────────────────────────────────────

// export async function renderPptx(params: {
//   marpMarkdown: string
//   outputPath: string
//   outputDir: string
// }): Promise<void> {
//   const { marpMarkdown, outputPath, outputDir } = params

//   fs.mkdirSync(path.dirname(outputPath), { recursive: true })

//   // Write marp markdown
//   const marpInputPath = path.join(outputDir, "report.marp.md")
//   fs.writeFileSync(marpInputPath, marpMarkdown, "utf-8")
//   console.log(`[pptx] Marp markdown written: ${marpInputPath}`)

//   // Resolve theme: look for aganitha.css in templates/ at project root
//   const projectRoot = process.cwd()
//   const themeSource = path.join(projectRoot, "templates", "aganitha_ppt.css")

//   // Copy theme next to the marp input file so Marp can find it
//   const themeDest = path.join(outputDir, "aganitha_ppt.css")
//   if (fs.existsSync(themeSource)) {
//     fs.copyFileSync(themeSource, themeDest)
//     console.log(`[pptx] Theme copied: ${themeDest}`)
//   } else {
//     console.warn(`[pptx] Theme not found at ${themeSource} — using default theme`)
//   }

//   const themeArg = fs.existsSync(themeDest)
//     ? `--theme "${themeDest}"`
//     : ""

//   try {
//     execSync(
//       `npx --yes @marp-team/marp-cli "${marpInputPath}" --pptx --output "${outputPath}" --allow-local-files --html ${themeArg}`,
//       {
//         stdio: "pipe",
//         cwd: outputDir   // ← critical: relative image paths in marp.md resolve from here
//       }
//     )
//     console.log(`[pptx] Written: ${outputPath}`)
//   } catch (err) {
//     console.error(`[pptx] Marp CLI failed: ${err}`)
//     throw new Error(`PPTX generation failed: ${err}`)
//   }
// }

// // ─────────────────────────────────────────────
// // PDF FROM MARP (bonus — same input, different output)
// // ─────────────────────────────────────────────

// export async function renderPdfFromMarp(params: {
//   marpMarkdown: string
//   outputPath: string
//   outputDir: string
// }): Promise<void> {
//   const { marpMarkdown, outputPath, outputDir } = params

//   fs.mkdirSync(path.dirname(outputPath), { recursive: true })

//   const marpInputPath = path.join(outputDir, "report.marp.md")
//   fs.writeFileSync(marpInputPath, marpMarkdown, "utf-8")

//   const themeSource = path.join(process.cwd(), "templates", "aganitha.css")
//   const themeDest = path.join(outputDir, "aganitha.css")
//   if (fs.existsSync(themeSource)) fs.copyFileSync(themeSource, themeDest)

//   const themeArg = fs.existsSync(themeDest) ? `--theme "${themeDest}"` : ""

//   try {
//     execSync(
//       `npx --yes @marp-team/marp-cli "${marpInputPath}" --pdf --output "${outputPath}" --allow-local-files --html ${themeArg}`,
//       { stdio: "pipe", cwd: outputDir }
//     )
//     console.log(`[pptx→pdf] Written: ${outputPath}`)
//   } catch (err) {
//     console.error(`[pptx→pdf] Marp CLI failed: ${err}`)
//     throw new Error(`PDF from Marp generation failed: ${err}`)
//   }
// }

import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// ─────────────────────────────────────────────
// PPTX RENDERER (Marp CLI)
// Theme: templates/aganitha_ppt.css
// --theme-set registers the custom theme so
// "theme: aganitha" in frontmatter resolves correctly.
// --html enables mermaid fence rendering.
// cwd = outputDir so relative image paths resolve.
// ─────────────────────────────────────────────

export async function renderPptx(params: {
  marpMarkdown: string
  outputPath: string
  outputDir: string
}): Promise<void> {
  const { marpMarkdown, outputPath, outputDir } = params

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  // write marp markdown
  const marpInputPath = path.join(outputDir, "report.marp.md")
  fs.writeFileSync(marpInputPath, marpMarkdown, "utf-8")
  console.log(`[pptx] Marp markdown written: ${marpInputPath}`)

  // locate theme
  const projectRoot = process.cwd()
  const themeSource = path.join(projectRoot, "templates", "aganitha_ppt.css")
  const themeDest   = path.join(outputDir, "aganitha_ppt.css")

  if (fs.existsSync(themeSource)) {
    fs.copyFileSync(themeSource, themeDest)
    console.log(`[pptx] Theme copied: ${themeDest}`)
  } else {
    console.warn(`[pptx] Theme not found at ${themeSource} — using Marp default`)
  }

  // --theme-set registers the CSS file as a named theme
  // the "theme: aganitha" frontmatter then selects it by filename stem
  const themeSetArg = fs.existsSync(themeDest)
    ? `--theme-set "${themeDest}"`
    : ""

  const cmd = [
    `npx --yes @marp-team/marp-cli`,
    `"${marpInputPath}"`,
    `--pptx`,
    `--output "${outputPath}"`,
    `--allow-local-files`,
    `--html`,          // required for mermaid + custom HTML divs
    themeSetArg,
  ].filter(Boolean).join(" ")

  console.log(`[pptx] Running: ${cmd}`)

  try {
    execSync(cmd, { stdio: "pipe", cwd: outputDir })
    console.log(`[pptx] Written: ${outputPath}`)
  } catch (err) {
    console.error(`[pptx] Marp CLI failed: ${err}`)
    throw new Error(`PPTX generation failed: ${err}`)
  }
}

// ─────────────────────────────────────────────
// PDF FROM MARP
// ─────────────────────────────────────────────

export async function renderPdfFromMarp(params: {
  marpMarkdown: string
  outputPath: string
  outputDir: string
}): Promise<void> {
  const { marpMarkdown, outputPath, outputDir } = params

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  const marpInputPath = path.join(outputDir, "report.marp.md")
  fs.writeFileSync(marpInputPath, marpMarkdown, "utf-8")

  const themeSource = path.join(process.cwd(), "templates", "aganitha_ppt.css")
  const themeDest   = path.join(outputDir, "aganitha_ppt.css")
  if (fs.existsSync(themeSource)) fs.copyFileSync(themeSource, themeDest)

  const themeSetArg = fs.existsSync(themeDest) ? `--theme-set "${themeDest}"` : ""

  const cmd = [
    `npx --yes @marp-team/marp-cli`,
    `"${marpInputPath}"`,
    `--pdf`,
    `--output "${outputPath}"`,
    `--allow-local-files`,
    `--html`,
    themeSetArg,
  ].filter(Boolean).join(" ")

  try {
    execSync(cmd, { stdio: "pipe", cwd: outputDir })
    console.log(`[pptx→pdf] Written: ${outputPath}`)
  } catch (err) {
    console.error(`[pptx→pdf] Marp CLI failed: ${err}`)
    throw new Error(`PDF from Marp generation failed: ${err}`)
  }
}