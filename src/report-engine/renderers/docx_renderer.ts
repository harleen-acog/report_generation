// import fs from "fs"
// import path from "path"
// import {
//   Document,
//   Packer,
//   Paragraph,
//   TextRun,
//   Table,
//   TableRow,
//   TableCell,
//   ImageRun,
//   HeadingLevel,
//   AlignmentType,
//   BorderStyle,
//   WidthType,
//   ShadingType,
//   LevelFormat,
//   PageNumber,
//   PageBreak,
//   Footer,
//   Header,
//   TabStopType,
//   TabStopPosition
// } from "docx"

// // ─────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────

// type DocxBlock =
//   | { type: "heading1"; text: string }
//   | { type: "heading2"; text: string }
//   | { type: "heading3"; text: string }
//   | { type: "paragraph"; text: string }
//   | { type: "bullet"; text: string }
//   | { type: "table"; headers: string[]; rows: string[][] }
//   | { type: "image"; path: string; alt: string }
//   | { type: "divider" }
//   | { type: "pagebreak" }

// // ─────────────────────────────────────────────
// // MARKDOWN PARSER → DOCX BLOCKS
// // ─────────────────────────────────────────────

// function parseMarkdownToBlocks(markdown: string): DocxBlock[] {
//   const lines = markdown.split("\n")
//   const blocks: DocxBlock[] = []
//   let i = 0

//   while (i < lines.length) {
//     const line = lines[i]

//     // headings
//     if (line.startsWith("# ")) {
//       blocks.push({ type: "heading1", text: line.slice(2).trim() })
//       i++; continue
//     }
//     if (line.startsWith("## ")) {
//       blocks.push({ type: "heading2", text: line.slice(3).trim() })
//       i++; continue
//     }
//     if (line.startsWith("### ")) {
//       blocks.push({ type: "heading3", text: line.slice(4).trim() })
//       i++; continue
//     }

//     // divider
//     if (line.trim() === "---") {
//       blocks.push({ type: "divider" })
//       i++; continue
//     }

//     // image
//     const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
//     if (imageMatch) {
//       blocks.push({ type: "image", alt: imageMatch[1], path: imageMatch[2] })
//       i++; continue
//     }

//     // table
//     if (line.startsWith("|") && lines[i + 1]?.startsWith("|---")) {
//       const headers = line.split("|").filter(Boolean).map(h => h.trim())
//       const rows: string[][] = []
//       i += 2 // skip header and divider
//       while (i < lines.length && lines[i].startsWith("|")) {
//         rows.push(lines[i].split("|").filter(Boolean).map(c => c.trim()))
//         i++
//       }
//       blocks.push({ type: "table", headers, rows })
//       continue
//     }

//     // bullet
//     if (line.startsWith("- ") || line.startsWith("* ")) {
//       blocks.push({ type: "bullet", text: line.slice(2).trim() })
//       i++; continue
//     }

//     // blockquote
//     if (line.startsWith("> ")) {
//       blocks.push({ type: "paragraph", text: `⚠ ${line.slice(2).trim()}` })
//       i++; continue
//     }

//     // paragraph
//     const trimmed = line.trim()
//     if (trimmed.length > 0) {
//       blocks.push({ type: "paragraph", text: trimmed })
//     }

//     i++
//   }

//   return blocks
// }

// // ─────────────────────────────────────────────
// // BLOCK → DOCX ELEMENT CONVERTERS
// // ─────────────────────────────────────────────

// const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
// const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }
// const TABLE_WIDTH = 9360 // US letter with 1" margins

// function makeHeading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]): Paragraph {
//   return new Paragraph({
//     heading: level,
//     children: [new TextRun({ text, bold: true })]
//   })
// }

// function makeParagraph(text: string): Paragraph {
//   // strip basic markdown bold **text**
//   const cleaned = text.replace(/\*\*([^*]+)\*\*/g, "$1")
//   return new Paragraph({
//     children: [new TextRun({ text: cleaned, size: 24 })],
//     spacing: { after: 120 }
//   })
// }

// function makeBullet(text: string): Paragraph {
//   const cleaned = text.replace(/\*\*([^*]+)\*\*/g, "$1")
//   return new Paragraph({
//     numbering: { reference: "bullets", level: 0 },
//     children: [new TextRun({ text: cleaned, size: 24 })]
//   })
// }

// function makeDivider(): Paragraph {
//   return new Paragraph({
//     border: {
//       bottom: { style: BorderStyle.SINGLE, size: 6, color: "4C9BE8", space: 1 }
//     },
//     spacing: { before: 240, after: 240 },
//     children: []
//   })
// }

// function makeTable(headers: string[], rows: string[][]): Table {
//   const colWidth = Math.floor(TABLE_WIDTH / headers.length)

//   const headerRow = new TableRow({
//     tableHeader: true,
//     children: headers.map(h =>
//       new TableCell({
//         borders: BORDERS,
//         width: { size: colWidth, type: WidthType.DXA },
//         shading: { fill: "1E2761", type: ShadingType.CLEAR },
//         margins: { top: 80, bottom: 80, left: 120, right: 120 },
//         children: [
//           new Paragraph({
//             children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 22 })]
//           })
//         ]
//       })
//     )
//   })

//   const dataRows = rows.map((row, ri) =>
//     new TableRow({
//       children: row.map(cell =>
//         new TableCell({
//           borders: BORDERS,
//           width: { size: colWidth, type: WidthType.DXA },
//           shading: {
//             fill: ri % 2 === 0 ? "F8FAFD" : "FFFFFF",
//             type: ShadingType.CLEAR
//           },
//           margins: { top: 60, bottom: 60, left: 120, right: 120 },
//           children: [
//             new Paragraph({
//               children: [new TextRun({ text: cell, size: 20 })]
//             })
//           ]
//         })
//       )
//     })
//   )

//   return new Table({
//     width: { size: TABLE_WIDTH, type: WidthType.DXA },
//     columnWidths: Array(headers.length).fill(colWidth),
//     rows: [headerRow, ...dataRows]
//   })
// }

// function makeImage(imagePath: string, outputDir: string): Paragraph | null {
//   const resolvedPath = path.resolve(outputDir, imagePath)

//   if (!fs.existsSync(resolvedPath)) {
//     console.warn(`[docx] Image not found: ${resolvedPath}`)
//     return null
//   }

//   const imageBuffer = fs.readFileSync(resolvedPath)
//   const ext = path.extname(resolvedPath).toLowerCase().slice(1) as "png" | "jpg" | "jpeg"

//   return new Paragraph({
//     alignment: AlignmentType.CENTER,
//     spacing: { before: 240, after: 240 },
//     children: [
//       new ImageRun({
//         data: imageBuffer,
//         transformation: { width: 600, height: 338 },
//         type: ext === "jpg" ? "jpg" : "png"
//       })
//     ]
//   })
// }

// // ─────────────────────────────────────────────
// // MAIN DOCX RENDERER
// // ─────────────────────────────────────────────

// export async function renderDocx(params: {
//   markdown: string
//   outputPath: string
//   title: string
//   outputDir: string
// }): Promise<void> {
//   const { markdown, outputPath, title, outputDir } = params
//   const blocks = parseMarkdownToBlocks(markdown)
//   const children: (Paragraph | Table)[] = []

//   for (const block of blocks) {
//     switch (block.type) {
//       case "heading1":
//         children.push(makeHeading(block.text, HeadingLevel.HEADING_1))
//         break
//       case "heading2":
//         children.push(makeHeading(block.text, HeadingLevel.HEADING_2))
//         break
//       case "heading3":
//         children.push(makeHeading(block.text, HeadingLevel.HEADING_3))
//         break
//       case "paragraph":
//         children.push(makeParagraph(block.text))
//         break
//       case "bullet":
//         children.push(makeBullet(block.text))
//         break
//       case "divider":
//         children.push(makeDivider())
//         break
//       case "pagebreak":
//         children.push(new Paragraph({ children: [new PageBreak()] }))
//         break
//       case "table":
//         children.push(makeTable(block.headers, block.rows))
//         break
//       case "image": {
//         const img = makeImage(block.path, outputDir)
//         if (img) children.push(img)
//         break
//       }
//     }
//   }

//   const doc = new Document({
//     numbering: {
//       config: [
//         {
//           reference: "bullets",
//           levels: [{
//             level: 0,
//             format: LevelFormat.BULLET,
//             text: "•",
//             alignment: AlignmentType.LEFT,
//             style: {
//               paragraph: { indent: { left: 720, hanging: 360 } }
//             }
//           }]
//         }
//       ]
//     },
//     styles: {
//       default: {
//         document: { run: { font: "Calibri", size: 24 } }
//       },
//       paragraphStyles: [
//         {
//           id: "Heading1",
//           name: "Heading 1",
//           basedOn: "Normal",
//           next: "Normal",
//           quickFormat: true,
//           run: { size: 40, bold: true, font: "Calibri", color: "1E2761" },
//           paragraph: {
//             spacing: { before: 480, after: 240 },
//             outlineLevel: 0
//           }
//         },
//         {
//           id: "Heading2",
//           name: "Heading 2",
//           basedOn: "Normal",
//           next: "Normal",
//           quickFormat: true,
//           run: { size: 32, bold: true, font: "Calibri", color: "065A82" },
//           paragraph: {
//             spacing: { before: 360, after: 180 },
//             outlineLevel: 1
//           }
//         },
//         {
//           id: "Heading3",
//           name: "Heading 3",
//           basedOn: "Normal",
//           next: "Normal",
//           quickFormat: true,
//           run: { size: 26, bold: true, font: "Calibri", color: "1C7293" },
//           paragraph: {
//             spacing: { before: 240, after: 120 },
//             outlineLevel: 2
//           }
//         }
//       ]
//     },
//     sections: [
//       {
//         properties: {
//           page: {
//             size: { width: 12240, height: 15840 },
//             margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
//           }
//         },
//         headers: {
//           default: new Header({
//             children: [
//               new Paragraph({
//                 children: [
//                   new TextRun({ text: title, size: 18, color: "999999" })
//                 ]
//               })
//             ]
//           })
//         },
//         footers: {
//           default: new Footer({
//             children: [
//               new Paragraph({
//                 children: [
//                   new TextRun({ text: "Page ", size: 18, color: "999999" }),
//                   new TextRun({
//                     children: [PageNumber.CURRENT],
//                     size: 18,
//                     color: "999999"
//                   })
//                 ]
//               })
//             ]
//           })
//         },
//         children
//       }
//     ]
//   })

//   const buffer = await Packer.toBuffer(doc)
//   fs.mkdirSync(path.dirname(outputPath), { recursive: true })
//   fs.writeFileSync(outputPath, buffer)
//   console.log(`[docx] Written: ${outputPath}`)
// }

import fs from "fs"
import path from "path"
import https from "https"
import http from "http"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  LevelFormat,
  PageNumber,
  PageBreak,
  Footer,
  Header,
  ExternalHyperlink,
  UnderlineType
} from "docx"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type DocxBlock =
  | { type: "heading1"; text: string }
  | { type: "heading2"; text: string }
  | { type: "heading3"; text: string }
  | { type: "paragraph"; text: string; bold?: boolean }
  | { type: "bullet"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; path: string; alt: string }
  | { type: "divider" }
  | { type: "pagebreak" }

// ─────────────────────────────────────────────
// LOGO DOWNLOADER
// ─────────────────────────────────────────────

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http
    client.get(url, (res) => {
      const chunks: Buffer[] = []
      res.on("data", (c: Buffer) => chunks.push(c))
      res.on("end", () => resolve(Buffer.concat(chunks)))
      res.on("error", () => resolve(null))
    }).on("error", () => resolve(null))
  })
}

// ─────────────────────────────────────────────
// COVER PAGE BUILDER
// ─────────────────────────────────────────────

async function buildCoverPage(title: string, date: string): Promise<(Paragraph | Table)[]> {
  const elements: (Paragraph | Table)[] = []

  // Try to embed logo
  const logoBuffer = await fetchImageBuffer(
    "https://www.aganitha.ai/wp-content/uploads/2023/05/aganitha-logo.png"
  )

  if (logoBuffer) {
    elements.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 1200, after: 480 },
      children: [
        new ImageRun({
          data: logoBuffer,
          transformation: { width: 160, height: 45 },
          type: "png"
        })
      ]
    }))
  } else {
    // Fallback text logo
    elements.push(new Paragraph({
      spacing: { before: 1200, after: 480 },
      children: [
        new TextRun({
          text: "AGANITHA",
          bold: true,
          size: 36,
          color: "4C9BE8",
          font: "Calibri"
        })
      ]
    }))
  }

  // Label
  elements.push(new Paragraph({
    spacing: { before: 0, after: 120 },
    children: [
      new TextRun({
        text: "DISEASE INTELLIGENCE REPORT",
        size: 18,
        color: "4C9BE8",
        bold: true,
        font: "Calibri",
        characterSpacing: 80
      })
    ]
  }))

  // Title
  elements.push(new Paragraph({
    spacing: { before: 120, after: 240 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 72,
        color: "0F2D50",
        font: "Calibri"
      })
    ]
  }))

  // Subtitle
  elements.push(new Paragraph({
    spacing: { before: 0, after: 960 },
    children: [
      new TextRun({
        text: "Comprehensive Clinical & Market Intelligence",
        size: 28,
        color: "4A7FA5",
        font: "Calibri"
      })
    ]
  }))

  // Divider line
  elements.push(new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 12, color: "4C9BE8", space: 1 }
    },
    spacing: { before: 0, after: 360 },
    children: []
  }))

  // Meta grid
  const metaRows: [string, string][] = [
    ["Prepared by", "Aganitha Cognitive Solutions"],
    ["Generated", date],
    ["Classification", "Confidential — For Internal Research Use Only"],
    ["Intended Use", "AI-generated report for internal research purposes only"]
  ]

  for (const [label, value] of metaRows) {
    elements.push(new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({ text: `${label}:  `, bold: true, size: 20, color: "4A7FA5", font: "Calibri" }),
        new TextRun({ text: value, size: 20, color: "1E2D3D", font: "Calibri" })
      ]
    }))
  }

  // Page break after cover
  elements.push(new Paragraph({
    spacing: { before: 240 },
    children: [new PageBreak()]
  }))

  return elements
}

// ─────────────────────────────────────────────
// MARKDOWN PARSER → DOCX BLOCKS
// ─────────────────────────────────────────────

function parseMarkdownToBlocks(markdown: string): DocxBlock[] {
  const lines = markdown.split("\n")
  const blocks: DocxBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("# ")) {
      blocks.push({ type: "heading1", text: line.slice(2).trim() })
      i++; continue
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "heading2", text: line.slice(3).trim() })
      i++; continue
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "heading3", text: line.slice(4).trim() })
      i++; continue
    }
    if (line.trim() === "---") {
      blocks.push({ type: "divider" })
      i++; continue
    }

    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imageMatch) {
      blocks.push({ type: "image", alt: imageMatch[1], path: imageMatch[2] })
      i++; continue
    }

    if (line.startsWith("|") && lines[i + 1]?.startsWith("|---")) {
      const headers = line.split("|").filter(Boolean).map(h => h.trim())
      const rows: string[][] = []
      i += 2
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i].split("|").filter(Boolean).map(c => c.trim()))
        i++
      }
      blocks.push({ type: "table", headers, rows })
      continue
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      blocks.push({ type: "bullet", text: line.slice(2).trim() })
      i++; continue
    }

    if (line.startsWith("> ")) {
      blocks.push({ type: "paragraph", text: `⚠  ${line.slice(2).trim()}` })
      i++; continue
    }

    const trimmed = line.trim()
    if (trimmed.length > 0) {
      blocks.push({ type: "paragraph", text: trimmed })
    }

    i++
  }

  return blocks
}

// ─────────────────────────────────────────────
// BLOCK → DOCX ELEMENT CONVERTERS
// ─────────────────────────────────────────────

const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "D0E4F0" }
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }
const TABLE_WIDTH = 9360

function makeHeading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]): Paragraph {
  return new Paragraph({ heading: level, children: [new TextRun({ text, bold: true })] })
}

function makeParagraph(text: string): Paragraph {
  // Handle **bold** inline
  const parts: TextRun[] = []
  const regex = /\*\*([^*]+)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(new TextRun({ text: text.slice(last, m.index), size: 22 }))
    parts.push(new TextRun({ text: m[1], bold: true, size: 22 }))
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(new TextRun({ text: text.slice(last), size: 22 }))

  return new Paragraph({ children: parts.length ? parts : [new TextRun({ text, size: 22 })], spacing: { after: 100 } })
}

function makeBullet(text: string): Paragraph {
  const cleaned = text.replace(/\*\*([^*]+)\*\*/g, "$1")
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text: cleaned, size: 22 })]
  })
}

function makeDivider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "4C9BE8", space: 1 } },
    spacing: { before: 200, after: 200 },
    children: []
  })
}

function makeTable(headers: string[], rows: string[][]): Table {
  const colWidth = Math.floor(TABLE_WIDTH / Math.max(headers.length, 1))

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h =>
      new TableCell({
        borders: BORDERS,
        width: { size: colWidth, type: WidthType.DXA },
        shading: { fill: "0F2D50", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })]
        })]
      })
    )
  })

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map(cell =>
        new TableCell({
          borders: BORDERS,
          width: { size: colWidth, type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? "F4F8FC" : "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: cell, size: 19 })]
          })]
        })
      )
    })
  )

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: Array(headers.length).fill(colWidth),
    rows: [headerRow, ...dataRows]
  })
}

function makeImage(imagePath: string, outputDir: string): Paragraph | null {
  // imagePath is relative to outputDir (e.g. "charts/section_x.png")
  // or absolute — handle both
  const resolvedPath = path.isAbsolute(imagePath)
    ? imagePath
    : path.resolve(outputDir, imagePath)

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`[docx] Image not found: ${resolvedPath}`)
    return null
  }

  const imageBuffer = fs.readFileSync(resolvedPath)
  const ext = path.extname(resolvedPath).toLowerCase().slice(1)
  const imageType = (ext === "jpg" || ext === "jpeg") ? "jpg" : "png"

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240 },
    children: [
      new ImageRun({
        data: imageBuffer,
        transformation: { width: 580, height: 326 },
        type: imageType
      })
    ]
  })
}

// ─────────────────────────────────────────────
// MAIN DOCX RENDERER
// ─────────────────────────────────────────────

export async function renderDocx(params: {
  markdown: string
  outputPath: string
  title: string
  outputDir: string
}): Promise<void> {
  const { markdown, outputPath, title, outputDir } = params

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  })

  // Build cover page
  const coverElements = await buildCoverPage(title, generatedDate)

  // Parse body content
  const blocks = parseMarkdownToBlocks(markdown)
  const bodyChildren: (Paragraph | Table)[] = []

  for (const block of blocks) {
    switch (block.type) {
      case "heading1":
        bodyChildren.push(makeHeading(block.text, HeadingLevel.HEADING_1))
        break
      case "heading2":
        bodyChildren.push(makeHeading(block.text, HeadingLevel.HEADING_2))
        break
      case "heading3":
        bodyChildren.push(makeHeading(block.text, HeadingLevel.HEADING_3))
        break
      case "paragraph":
        bodyChildren.push(makeParagraph(block.text))
        break
      case "bullet":
        bodyChildren.push(makeBullet(block.text))
        break
      case "divider":
        bodyChildren.push(makeDivider())
        break
      case "pagebreak":
        bodyChildren.push(new Paragraph({ children: [new PageBreak()] }))
        break
      case "table":
        bodyChildren.push(makeTable(block.headers, block.rows))
        break
      case "image": {
        const img = makeImage(block.path, outputDir)
        if (img) bodyChildren.push(img)
        break
      }
    }
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }]
    },
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 44, bold: true, font: "Calibri", color: "0F2D50" },
          paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 }
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 34, bold: true, font: "Calibri", color: "065A82" },
          paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 }
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 26, bold: true, font: "Calibri", color: "1C7293" },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
        }
      ]
    },
    sections: [
      // ── Section 1: Cover page (no header/footer) ──
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: coverElements
      },
      // ── Section 2: Body content (with header/footer) ──
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${title}  ·  Disease Intelligence Report`, size: 17, color: "4A7FA5" })
                ],
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "C8DFF0", space: 1 } }
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: "C8DFF0", space: 1 } },
                children: [
                  new TextRun({ text: "Aganitha Cognitive Solutions  ·  Confidential  ·  Page ", size: 17, color: "999999" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 17, color: "999999" }),
                  new TextRun({ text: " of ", size: 17, color: "999999" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, color: "999999" })
                ]
              })
            ]
          })
        },
        children: bodyChildren
      }
    ]
  })

  const buffer = await Packer.toBuffer(doc)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buffer)
  console.log(`[docx] Written: ${outputPath}`)
}