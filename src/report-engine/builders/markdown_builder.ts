// import nunjucks from "nunjucks"
// import path from "path"
// import fs from "fs"
// import { SectionConfig, SectionResult, ReportResult, ReportConfig } from "../types.js"

// const TEMPLATES_ROOT = path.resolve("./templates")

// // ─────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────

// function formatFieldName(name: string): string {
//   return name
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, c => c.toUpperCase())
// }

// function buildMarkdownTable(rows: Record<string, unknown>[]): string {
//   if (rows.length === 0) return ""
//   const headers = Object.keys(rows[0])
//   const headerRow = `| ${headers.map(formatFieldName).join(" | ")} |`
//   const dividerRow = `| ${headers.map(() => "---").join(" | ")} |`
//   const dataRows = rows.map(row =>
//     `| ${headers.map(h => String(row[h] ?? "")).join(" | ")} |`
//   )
//   return [headerRow, dividerRow, ...dataRows].join("\n")
// }

// /**
//  * Returns a path relative to outputDir itself (not to ./output root).
//  * chartPath is absolute; outputDir is absolute.
//  * Result: "charts/section_chart.png" — directly usable by renderers
//  * that resolve relative to outputDir.
//  */
// function toRelativeToOutputDir(chartPath: string, outputDir: string): string {
//   return path.relative(outputDir, chartPath)
// }

// // ─────────────────────────────────────────────
// // SECTION MARKDOWN BUILDER
// // ─────────────────────────────────────────────

// export function buildSectionMarkdown(params: {
//   report_type: string
//   section: SectionConfig
//   result: SectionResult
//   visualPaths: Record<string, string>
//   outputDir: string
// }): string {
//   const { report_type, section, result, visualPaths, outputDir } = params

//   const templateDir = path.join(TEMPLATES_ROOT, report_type, "markdown")
//   const templateFile = `${section.section}.md.njk`
//   const templatePath = path.join(templateDir, templateFile)

//   if (!fs.existsSync(templatePath)) {
//     return buildGenericSectionMarkdown({ section, result, visualPaths, outputDir })
//   }

//   const env = nunjucks.configure(templateDir, {
//     autoescape: false,
//     trimBlocks: true,
//     lstripBlocks: true
//   })

//   return env.render(templateFile, {
//     section,
//     data: result.data ?? {},
//     status: result.status,
//     visualPaths
//   })
// }

// // ─────────────────────────────────────────────
// // GENERIC FALLBACK RENDERER (for report.md / PDF / DOCX)
// // Images use paths relative to outputDir so renderers resolve correctly.
// // ─────────────────────────────────────────────

// function buildGenericSectionMarkdown(params: {
//   section: SectionConfig
//   result: SectionResult
//   visualPaths: Record<string, string>
//   outputDir: string
// }): string {
//   const { section, result, visualPaths, outputDir } = params
//   const lines: string[] = []

//   lines.push(`## ${section.title}`)
//   lines.push("")

//   if (result.status === "placeholder" || result.status === "rejected") {
//     lines.push(`> ⚠️ ${result.error ?? "Section data unavailable"}`)
//     lines.push("")
//     return lines.join("\n")
//   }

//   const data = result.data ?? {}
//   const renderMode = section.render?.docx ?? "hybrid"

//   // freetext fields first
//   for (const field of section.freetext_fields ?? []) {
//     const value = data[field.name]
//     if (typeof value === "string" && value.trim()) {
//       lines.push(value.trim())
//       lines.push("")
//     }
//   }

//   // structured fields
//   for (const field of section.structured_fields ?? []) {
//     const value = data[field.name]
//     if (value === undefined || value === null) continue

//     if (Array.isArray(value)) {
//       if (value.length === 0) continue
//       lines.push(`### ${formatFieldName(field.name)}`)
//       lines.push("")
//       if (renderMode === "table" && typeof value[0] === "object") {
//         lines.push(buildMarkdownTable(value as Record<string, unknown>[]))
//       } else {
//         for (const item of value) {
//           if (typeof item === "object" && item !== null) {
//             const obj = item as Record<string, unknown>
//             const firstVal = Object.values(obj)[0]
//             lines.push(`- **${firstVal}** — ${Object.entries(obj).slice(1).map(([k, v]) => `${formatFieldName(k)}: ${v}`).join(" | ")}`)
//           } else {
//             lines.push(`- ${item}`)
//           }
//         }
//       }
//       lines.push("")
//     } else if (typeof value === "object" && value !== null) {
//       lines.push(`### ${formatFieldName(field.name)}`)
//       lines.push("")
//       const obj = value as Record<string, unknown>
//       for (const [k, v] of Object.entries(obj)) {
//         if (v !== undefined && v !== null) {
//           lines.push(`**${formatFieldName(k)}:** ${v}`)
//           lines.push("")
//         }
//       }
//     } else if (typeof value === "string" && value.trim()) {
//       lines.push(`### ${formatFieldName(field.name)}`)
//       lines.push("")
//       lines.push(value.trim())
//       lines.push("")
//     }
//   }

//   // embed chart images — path relative to outputDir
//   for (const [, chartPath] of Object.entries(visualPaths)) {
//     const rel = toRelativeToOutputDir(chartPath, outputDir)
//     lines.push(`![Chart](${rel})`)
//     lines.push("")
//   }

//   return lines.join("\n")
// }

// // ─────────────────────────────────────────────
// // FULL REPORT MARKDOWN (PDF + DOCX source)
// // ─────────────────────────────────────────────

// export function assembleReportMarkdown(params: {
//   reportResult: ReportResult
//   reportConfig: ReportConfig
//   sectionConfigs: Record<string, SectionConfig>
//   allVisualPaths: Record<string, Record<string, string>>
//   outputDir: string
// }): string {
//   const { reportResult, reportConfig, sectionConfigs, allVisualPaths, outputDir } = params
//   const lines: string[] = []

//   const generatedDate = new Date(reportResult.generated_at).toLocaleDateString("en-GB", {
//     day: "numeric", month: "long", year: "numeric"
//   })

//   // ── Cover page ──
//   lines.push(`# ${reportResult.topic.name}`)
//   lines.push("")
//   lines.push(`**${reportConfig.description}**`)
//   lines.push("")
//   lines.push(`**Prepared by:** Aganitha Cognitive Solutions`)
//   lines.push(`**Generated:** ${generatedDate}`)
//   lines.push(`**Classification:** Confidential — For Internal Research Use Only`)
//   lines.push("")
//   lines.push("---")
//   lines.push("")

//   // ── Table of contents ──
//   lines.push("## Table of Contents")
//   lines.push("")
//   reportResult.all_sections.forEach((s, i) => {
//     const anchor = s.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
//     lines.push(`${i + 1}. [${s.title}](#${anchor})`)
//   })
//   lines.push("")
//   lines.push("---")
//   lines.push("")

//   // ── Sections ──
//   for (const sectionResult of reportResult.all_sections) {
//     const sectionConfig = sectionConfigs[sectionResult.sectionId]
//     if (!sectionConfig) continue

//     const visualPaths = allVisualPaths[sectionResult.sectionId] ?? {}

//     const sectionMarkdown = buildSectionMarkdown({
//       report_type: reportResult.report_type,
//       section: sectionConfig,
//       result: sectionResult,
//       visualPaths,
//       outputDir
//     })

//     lines.push(sectionMarkdown)
//     lines.push("---")
//     lines.push("")
//   }

//   return lines.join("\n")
// }

// // ─────────────────────────────────────────────
// // MARP ASSEMBLER (PPTX source)
// // Key differences from report.md:
// //   - Mermaid: raw ```mermaid fences (Marp renders natively)
// //   - Charts: image paths relative to outputDir (Marp cwd = outputDir)
// //   - Cover slide with Aganitha branding + external theme
// // ─────────────────────────────────────────────

// export function assembleReportMarp(params: {
//   reportResult: ReportResult
//   sectionConfigs: Record<string, SectionConfig>
//   allVisualPaths: Record<string, Record<string, string>>
//   outputDir: string
//   themePath?: string
// }): string {
//   const { reportResult, sectionConfigs, allVisualPaths, outputDir, themePath } = params
//   const lines: string[] = []

//   const generatedDate = new Date(reportResult.generated_at).toLocaleDateString("en-GB", {
//     day: "numeric", month: "long", year: "numeric"
//   })

//   const reportTypeLabel = reportResult.report_type
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, c => c.toUpperCase())

//   // ── Frontmatter ──
//   lines.push("---")
//   lines.push("marp: true")
//   lines.push("theme: aganitha_ppt")
//   lines.push("paginate: true")
//   lines.push("---")
//   lines.push("")

//   // ── Cover slide ──
//   lines.push("<!-- _class: cover -->")
//   lines.push("")
//   lines.push(`![logo](https://www.aganitha.ai/wp-content/uploads/2023/05/aganitha-logo.png)`)
//   lines.push("")
//   lines.push(`# ${reportResult.topic.name}`)
//   lines.push("")
//   lines.push(`## ${reportTypeLabel}`)
//   lines.push("")
//   lines.push(`Prepared by Aganitha Cognitive Solutions · ${generatedDate}`)
//   lines.push(`Confidential — AI-generated report for internal research use only`)
//   lines.push("")

//   // ── Section slides ──
//   for (const sectionResult of reportResult.all_sections) {
//     const sectionConfig = sectionConfigs[sectionResult.sectionId]
//     if (!sectionConfig) continue

//     const visualPaths = allVisualPaths[sectionResult.sectionId] ?? {}

//     // read raw mermaid string from section data (needed for inline fences)
//     const mermaidField = sectionConfig.mermaid?.output_field
//     const rawMermaid = mermaidField && sectionResult.data
//       ? String(sectionResult.data[mermaidField] ?? "")
//       : ""

//     const slides = buildSectionSlidesMarp({
//       section: sectionConfig,
//       result: sectionResult,
//       visualPaths,
//       outputDir,
//       slideBudget: sectionConfig.slide_budget ?? 2,
//       rawMermaid
//     })

//     for (const slide of slides) {
//       lines.push("---")
//       lines.push("")
//       lines.push(slide)
//       lines.push("")
//     }
//   }

//   return lines.join("\n")
// }

// // ─────────────────────────────────────────────
// // SECTION SLIDE BUILDER (Marp-specific)
// // ─────────────────────────────────────────────

// function buildSectionSlidesMarp(params: {
//   section: SectionConfig
//   result: SectionResult
//   visualPaths: Record<string, string>
//   outputDir: string
//   slideBudget: number
//   rawMermaid: string
// }): string[] {
//   const { section, result, visualPaths, outputDir, slideBudget, rawMermaid } = params
//   const slides: string[] = []

//   if (result.status !== "fulfilled" || !result.data) {
//     slides.push(`## ${section.title}\n\n> ⚠️ ${result.error ?? "Section data unavailable"}`)
//     return slides
//   }

//   const data = result.data

//   // ── Slide 1: title + narrative + key bullets ──
//   const s1: string[] = []
//   s1.push(`## ${section.title}`)
//   s1.push("")

//   for (const field of section.freetext_fields ?? []) {
//     const value = data[field.name]
//     if (typeof value === "string" && value.trim()) {
//       const truncated = value.length > 380 ? value.slice(0, 377) + "..." : value
//       s1.push(truncated)
//       s1.push("")
//       break
//     }
//   }

//   for (const field of section.structured_fields ?? []) {
//     const value = data[field.name]
//     if (!Array.isArray(value) || value.length === 0) continue
//     s1.push(`**${formatFieldName(field.name)}**`)
//     for (const item of value.slice(0, 4)) {
//       if (typeof item === "string") {
//         s1.push(`- ${item}`)
//       } else if (typeof item === "object" && item !== null) {
//         const first = Object.values(item as Record<string, unknown>)[0]
//         s1.push(`- ${first}`)
//       }
//     }
//     s1.push("")
//     break
//   }

//   slides.push(s1.join("\n"))

//   // ── Slide 2: visuals ──
//   if (slideBudget >= 2) {
//     const hasChartImages = Object.keys(visualPaths).some(k => k !== "mermaid_diagram")
//     const hasMermaid = rawMermaid.trim().length > 0

//     if (hasChartImages || hasMermaid) {
//       const s2: string[] = []
//       s2.push(`## ${section.title} — Data`)
//       s2.push("")

//       // Prefer mermaid as inline fence (Marp renders natively, no PNG needed)
//       if (hasMermaid) {
//         s2.push("```mermaid")
//         s2.push(rawMermaid.trim())
//         s2.push("```")
//         s2.push("")
//       } else {
//         // chart PNG — path relative to outputDir (Marp cwd = outputDir)
//         for (const [chartId, chartPath] of Object.entries(visualPaths)) {
//           if (chartId === "mermaid_diagram") continue
//           const rel = toRelativeToOutputDir(chartPath, outputDir)
//           s2.push(`![chart](${rel})`)
//           s2.push("")
//           break // one chart per slide
//         }
//       }

//       slides.push(s2.join("\n"))
//     }
//   }

//   // ── Slide 3: overflow table ──
//   if (slideBudget >= 3) {
//     for (const field of section.structured_fields ?? []) {
//       const value = data[field.name]
//       if (!Array.isArray(value) || value.length < 2) continue
//       if (typeof value[0] !== "object") continue

//       const s3: string[] = []
//       s3.push(`## ${section.title} — ${formatFieldName(field.name)}`)
//       s3.push("")
//       s3.push(buildMarkdownTable((value as Record<string, unknown>[]).slice(0, 8)))
//       slides.push(s3.join("\n"))
//       break
//     }
//   }

//   return slides.slice(0, slideBudget)
// }

import path from "path"
import fs from "fs"
import {
  SectionConfig,
  SectionResult,
  ReportResult,
  ReportConfig
} from "../types.js"

function formatFieldName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

function buildMarkdownTable(rows: Record<string, unknown>[]): string {
  if (!rows || rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const headerRow = `| ${headers.map(formatFieldName).join(" | ")} |`
  const divider   = `| ${headers.map(() => "---").join(" | ")} |`
  const dataRows  = rows.map(row =>
    `| ${headers.map(h => String(row[h] ?? "—")).join(" | ")} |`
  )
  return [headerRow, divider, ...dataRows].join("\n")
}

function relPath(absPath: string, outputDir: string): string {
  return path.relative(outputDir, absPath)
}

function getNarrativeText(data: Record<string, unknown>, section: SectionConfig, maxLen: number): string {
  for (const field of section.freetext_fields ?? []) {
    const value = data[field.name]
    if (typeof value === "string" && value.trim()) {
      const text = value.trim()
      return text.length > maxLen ? text.slice(0, maxLen - 3) + "..." : text
    }
  }
  return ""
}

function getBulletPoints(data: Record<string, unknown>, section: SectionConfig, max: number): string[] {
  for (const field of section.structured_fields ?? []) {
    const value = data[field.name]
    if (!Array.isArray(value) || value.length === 0) continue
    return value.slice(0, max).map(item => {
      if (typeof item === "string") return item
      if (typeof item === "object" && item !== null) {
        const first = Object.values(item as Record<string, unknown>)[0]
        return typeof first === "string" ? first : JSON.stringify(first)
      }
      return String(item)
    })
  }
  return []
}

function getFirstStructuredFieldName(section: SectionConfig): string {
  for (const field of section.structured_fields ?? []) return formatFieldName(field.name)
  return ""
}

function buildTableSlide(section: SectionConfig, data: Record<string, unknown>): string | null {
  for (const field of section.structured_fields ?? []) {
    const value = data[field.name]
    if (!Array.isArray(value) || value.length < 2 || typeof value[0] !== "object") continue
    const lines: string[] = []
    lines.push(`<!-- transition: slide -->`)
    lines.push(`<!-- _class: data -->`)
    lines.push("")
    lines.push(`## ${section.title} — ${formatFieldName(field.name)}`)
    lines.push("")
    lines.push(buildMarkdownTable((value as Record<string, unknown>[]).slice(0, 8)))
    lines.push("")
    return lines.join("\n")
  }
  return null
}

// ─────────────────────────────────────────────
// SECTION MARKDOWN (report.md)
// ─────────────────────────────────────────────

function buildSectionMarkdown(params: {
  report_type: string
  section: SectionConfig
  result: SectionResult
  visualPaths: Record<string, string>
  outputDir: string
}): string {
  const { section, result, visualPaths, outputDir } = params
  const lines: string[] = []

  lines.push(`## ${section.title}`)
  lines.push("")

  if (result.status !== "fulfilled" || !result.data) {
    lines.push(`> ⚠️ ${result.error ?? "Section data unavailable"}`)
    lines.push("")
    return lines.join("\n")
  }

  const data = result.data

  for (const field of section.freetext_fields ?? []) {
    const value = data[field.name]
    if (typeof value === "string" && value.trim()) {
      lines.push(value.trim())
      lines.push("")
    }
  }

  for (const field of section.structured_fields ?? []) {
    const value = data[field.name]
    if (value === undefined || value === null) continue

    if (Array.isArray(value) && value.length > 0) {
      lines.push(`### ${formatFieldName(field.name)}`)
      lines.push("")
      if (typeof value[0] === "object") {
        lines.push(buildMarkdownTable(value as Record<string, unknown>[]))
      } else {
        for (const item of value) lines.push(`- ${item}`)
      }
      lines.push("")
    } else if (typeof value === "object" && value !== null) {
      lines.push(`### ${formatFieldName(field.name)}`)
      lines.push("")
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (v !== undefined && v !== null) {
          lines.push(`**${formatFieldName(k)}:** ${v}`)
          lines.push("")
        }
      }
    } else if (typeof value === "string" && value.trim()) {
      lines.push(`### ${formatFieldName(field.name)}`)
      lines.push("")
      lines.push(value.trim())
      lines.push("")
    }
  }

  // embed charts
  for (const [chartId, chartPath] of Object.entries(visualPaths)) {
    if (chartId === "mermaid_diagram") continue
    if (!fs.existsSync(chartPath)) continue
    lines.push(`![${formatFieldName(chartId)}](${relPath(chartPath, outputDir)})`)
    lines.push("")
  }

  // mermaid as PNG
  if (visualPaths["mermaid_diagram"] && fs.existsSync(visualPaths["mermaid_diagram"])) {
    lines.push(`![Mechanism Diagram](${relPath(visualPaths["mermaid_diagram"], outputDir)})`)
    lines.push("")
  }

  return lines.join("\n")
}

// ─────────────────────────────────────────────
// FULL REPORT MARKDOWN
// ─────────────────────────────────────────────

export function assembleReportMarkdown(params: {
  reportResult: ReportResult
  reportConfig: ReportConfig
  sectionConfigs: Record<string, SectionConfig>
  allVisualPaths: Record<string, Record<string, string>>
  outputDir: string
}): string {
  const { reportResult, reportConfig, sectionConfigs, allVisualPaths, outputDir } = params
  const lines: string[] = []

  const generatedDate = new Date(reportResult.generated_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  })
  lines.push(`![logo](https://www.aganitha.ai/wp-content/uploads/2023/05/aganitha-logo.png)`)
  lines.push("")
  lines.push(`# ${reportResult.topic.name}`)
  lines.push("")
  lines.push(`**${reportConfig.description}**`)
  lines.push("")
  lines.push(`**Prepared by:** Aganitha Cognitive Solutions`)
  lines.push(`**Generated:** ${generatedDate}`)
  lines.push(`**Classification:** Confidential — For Internal Research Use Only`)
  lines.push("")
  lines.push("---")
  lines.push("")
  lines.push("## Table of Contents")
  lines.push("")
  reportResult.all_sections.forEach((s, i) => {
    const anchor = s.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    lines.push(`${i + 1}. [${s.title}](#${anchor})`)
  })
  lines.push("")
  lines.push("---")
  lines.push("")

  for (const sectionResult of reportResult.all_sections) {
    const sectionConfig = sectionConfigs[sectionResult.sectionId]
    if (!sectionConfig) continue
    const visualPaths = allVisualPaths[sectionResult.sectionId] ?? {}
    lines.push(buildSectionMarkdown({
      report_type: reportResult.report_type,
      section: sectionConfig,
      result: sectionResult,
      visualPaths,
      outputDir
    }))
    lines.push("---")
    lines.push("")
  }

  return lines.join("\n")
}

// ─────────────────────────────────────────────
// MARP ASSEMBLER
// ─────────────────────────────────────────────

export function assembleReportMarp(params: {
  reportResult: ReportResult
  sectionConfigs: Record<string, SectionConfig>
  allVisualPaths: Record<string, Record<string, string>>
  outputDir: string
}): string {
  const { reportResult, sectionConfigs, allVisualPaths, outputDir } = params
  const lines: string[] = []

  const generatedDate = new Date(reportResult.generated_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  })

  const reportTypeLabel = reportResult.report_type
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())

  lines.push("---")
  lines.push("marp: true")
  lines.push("theme: aganitha_ppt")
  lines.push("paginate: true")
  lines.push("---")
  lines.push("")
  lines.push("<!-- _class: cover -->")
  lines.push("<!-- transition: fade -->")
  lines.push("")
  lines.push("")
  lines.push("![Logo width:200px](https://www.aganitha.ai/wp-content/uploads/2023/05/aganitha-logo.png)")
  lines.push("")
  lines.push(`# ${reportResult.topic.name}`)
  lines.push("")
  lines.push(`## ${reportTypeLabel}`)
  lines.push("")
  lines.push(`Prepared by Aganitha Cognitive Solutions · ${generatedDate}`)
  lines.push(`Confidential — AI-generated report for internal research use only`)
  lines.push("")

  for (const sectionResult of reportResult.all_sections) {
    const sectionConfig = sectionConfigs[sectionResult.sectionId]
    if (!sectionConfig) continue

    const visualPaths = allVisualPaths[sectionResult.sectionId] ?? {}
    const mermaidField = sectionConfig.mermaid?.output_field
    const rawMermaid = mermaidField && sectionResult.data
      ? String(sectionResult.data[mermaidField] ?? "")
      : ""

    const slides = buildSectionSlidesMarp({
      section: sectionConfig,
      result: sectionResult,
      visualPaths,
      outputDir,
      slideBudget: sectionConfig.slide_budget ?? 2,
      rawMermaid
    })

    for (const slide of slides) {
      lines.push("---")
      lines.push("")
      lines.push(slide)
      lines.push("")
    }
  }

  return lines.join("\n")
}

// ─────────────────────────────────────────────
// SECTION SLIDES (Marp)
// ─────────────────────────────────────────────

function buildSectionSlidesMarp(params: {
  section: SectionConfig
  result: SectionResult
  visualPaths: Record<string, string>
  outputDir: string
  slideBudget: number
  rawMermaid: string
}): string[] {
  const { section, result, visualPaths, outputDir, slideBudget, rawMermaid } = params
  const slides: string[] = []

  if (result.status !== "fulfilled" || !result.data) {
    slides.push(`<!-- transition: fade -->\n## ${section.title}\n\n> **Note:** ${result.error ?? "Section data unavailable"}`)
    return slides
  }

  const data = result.data
  const chartEntries = Object.entries(visualPaths).filter(([k]) => k !== "mermaid_diagram")
  const hasChartImage = chartEntries.length > 0
  const hasMermaid = rawMermaid.trim().length > 0
  const hasVisual = hasChartImage || hasMermaid
  const isInsights = section.section.includes("key_insights")

  const narrativeText = getNarrativeText(data, section, 320)
  const bulletPoints = getBulletPoints(data, section, 5)

  // ── SLIDE 1: Title + Context ──
  const s1: string[] = []

  if (isInsights) {
    s1.push(`<!-- transition: fade -->`)
    s1.push(`<!-- _class: insights -->`)
    s1.push("")
    s1.push(`## ${section.title}`)
    s1.push("")

    const takeaways = data["executive_takeaways"]
    if (Array.isArray(takeaways)) {
      for (const t of takeaways.slice(0, 5)) s1.push(`- ${t}`)
    } else if (narrativeText) {
      s1.push(`<div class="highlight">${narrativeText}</div>`)
    }
    slides.push(s1.join("\n"))

  } else if (hasVisual && narrativeText) {
    // Creative 2-col: Narrative + Visual
    s1.push(`<!-- transition: slide -->`)
    s1.push(`<!-- _class: img-right -->`)
    s1.push("")
    s1.push(`## ${section.title}`)
    s1.push("")
    s1.push(`<div class="cols">`)
    s1.push(`<div class="col-left">`)
    s1.push("")
    s1.push(narrativeText)
    s1.push("")
    if (bulletPoints.length > 0) {
      s1.push(`**Key Points:**`)
      for (const b of bulletPoints.slice(0, 3)) s1.push(`- ${b}`)
    }
    s1.push(`</div>`)
    s1.push(`<div class="col-right">`)
    s1.push("")
    if (visualPaths["mermaid_diagram"]) {
      const rel = relPath(visualPaths["mermaid_diagram"], outputDir)
      s1.push(`![Mechanism Diagram](${rel})`)
    } else {
      const [chartId, chartPath] = chartEntries[0]
      const rel = relPath(chartPath, outputDir)
      s1.push(`![${formatFieldName(chartId)}](${rel})`)
    }
    s1.push(`</div>`)
    s1.push(`</div>`)
    slides.push(s1.join("\n"))

  } else {
    // Standard layout with Highlight box
    s1.push(`<!-- transition: slide -->`)
    s1.push(`## ${section.title}`)
    s1.push("")
    if (narrativeText) {
      s1.push(`> ${narrativeText}`)
      s1.push("")
    }
    if (bulletPoints.length > 0) {
      s1.push(`<div class="highlight">`)
      s1.push(`<strong>${getFirstStructuredFieldName(section)}</strong>`)
      s1.push("")
      for (const b of bulletPoints.slice(0, 5)) s1.push(`- ${b}`)
      s1.push(`</div>`)
    }
    slides.push(s1.join("\n"))
  }

  // ── SLIDE 2 ──
  if (slideBudget >= 2) {
    const slide1WasTwoCol = hasVisual && (narrativeText || bulletPoints.length > 0) && !isInsights

    if (!slide1WasTwoCol && hasVisual) {
      // standalone visual slide
      const s2: string[] = []
      s2.push(`<!-- transition: fade -->`)
      s2.push(`<!-- _class: data -->`)
      s2.push("")
      s2.push(`## ${section.title} — Data`)
      s2.push("")

      if (visualPaths["mermaid_diagram"]) {
        const rel = relPath(visualPaths["mermaid_diagram"], outputDir)
        s2.push(`![Mechanism Diagram](${rel})`)
      } else {
        const [chartId, chartPath] = chartEntries[0]
        s2.push(`![${formatFieldName(chartId)}](${relPath(chartPath, outputDir)})`)
      }

      s2.push("")
      slides.push(s2.join("\n"))
    } else {
      // table slide
      const t = buildTableSlide(section, data)
      if (t) slides.push(t)
    }
  }

  // ── SLIDE 3 ──
  if (slideBudget >= 3) {
    const futureDirections = data["future_directions"]
    if (chartEntries.length > 1) {
      const s3: string[] = []
      s3.push(`<!-- transition: fade -->`)
      s3.push(`<!-- _class: data -->`)
      s3.push("")
      s3.push(`## ${section.title} — Pipeline Distribution`)
      s3.push("")
      const [chartId, chartPath] = chartEntries[1]
      s3.push(`![${formatFieldName(chartId)}](${relPath(chartPath, outputDir)})`)
      s3.push("")
      slides.push(s3.join("\n"))
    } else if (Array.isArray(futureDirections) && futureDirections.length > 0) {
      const s3: string[] = []
      s3.push(`<!-- transition: slide -->`)
      s3.push(`<!-- _class: insights -->`)
      s3.push("")
      s3.push(`## Future Directions`)
      s3.push("")
      for (const d of (futureDirections as string[]).slice(0, 5)) s3.push(`- ${d}`)
      s3.push("")
      slides.push(s3.join("\n"))
    } else {
      const t = buildTableSlide(section, data)
      if (t) slides.push(t)
    }
  }

  return slides.slice(0, slideBudget)
}