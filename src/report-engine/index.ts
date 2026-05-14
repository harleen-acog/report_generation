
import fs from "fs"
import path from "path"
import { runReport } from "./runners/report_runner.js"
import { renderSectionVisuals } from "./builders/chart_renderer.js"
import { assembleReportMarkdown, assembleReportMarp } from "./builders/markdown_builder.js"
import { renderDocx } from "./renderers/docx_renderer.js"
import { renderPdf } from "./renderers/pdf_renderer.js"
import { renderPptx } from "./renderers/pptx_renderer.js"
import { loadReportConfig, loadAllSectionConfigs } from "./config_loader.js"
import { ReportInput, SectionConfig, ReportResult, ReportConfig } from "./types.js"
import { GeminiClient } from "../llm/gemini_client.js"
import { planSlidesForSection } from "./runners/slide_planner.js"
import debug from '@aganitha/atk-debug';

debug.enable('workflow:*');
export const pathlog = debug('workflow:paths');

// ─────────────────────────────────────────────
// MAIN ORCHESTRATOR
// ─────────────────────────────────────────────

export async function generateReport(params: {
  report_type: string
  input: ReportInput
  formats?: string[]
}): Promise<void> {
  const { report_type, input, formats } = params

  const reportConfig = loadReportConfig(report_type)
  const requestedFormats = formats ?? reportConfig.output.formats

  const slug = input.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")

  const outputDir = path.resolve(reportConfig.output.output_dir, slug)
  fs.mkdirSync(outputDir, { recursive: true })

  console.log(`\n═══════════════════════════════════════`)
  console.log(`  Report Engine`)
  console.log(`  Type    : ${report_type}`)
  console.log(`  Topic   : ${input.name}`)
  console.log(`  Formats : ${requestedFormats.join(", ")}`)
  console.log(`  Output  : ${outputDir}`)
  console.log(`═══════════════════════════════════════\n`)

  // ── PHASE 2: LLM ──────────────────────────────
  console.log("▶ Phase 2 — Generating sections via LLM...")
  const reportResult = await runReport({ report_type, input })

  /* 
  // ── ORIGINAL LOGIC (Commented out to preserve) ────────────────
  const allSectionIds = reportConfig.runner.groups.flatMap(g => g.sections)
  const sectionConfigs = loadAllSectionConfigs(report_type, allSectionIds)

  reportResult.all_sections.forEach(s => {
    const icon = s.status === "fulfilled" ? "✅"
      : s.status === "placeholder" ? "⚠️ "
      : "❌ "
    console.log(`  ${icon} ${s.title}`)
  })

  // ── PHASE 3: CHARTS & DIAGRAMS ────────────────
  console.log("\n▶ Phase 3 — Rendering charts and diagrams...")
  const allVisualPaths: Record<string, Record<string, string>> = {}

  for (const sectionResult of reportResult.all_sections) {
    if (sectionResult.status !== "fulfilled" || !sectionResult.data) continue

    const sectionConfig: SectionConfig = sectionConfigs[sectionResult.sectionId]
    if (!sectionConfig) continue

    const hasCharts = sectionConfig.charts && sectionConfig.charts.length > 0
    const hasMermaid = sectionConfig.mermaid?.output_field &&
      sectionResult.data[sectionConfig.mermaid.output_field]

    if (!hasCharts && !hasMermaid) continue

    console.log(`  Rendering visuals for: ${sectionConfig.title}`)

    const visualPaths = await renderSectionVisuals({
      sectionId: sectionResult.sectionId,
      sectionData: sectionResult.data,
      chartConfigs: sectionConfig.charts ?? [],
      mermaidOutputField: sectionConfig.mermaid?.output_field ?? null,
      outputDir
    })

    allVisualPaths[sectionResult.sectionId] = visualPaths
  }

  // ── PHASE 4: MARKDOWN ─────────────────────────
  console.log("\n▶ Phase 4 — Assembling markdown...")

  const markdown = assembleReportMarkdown({
    reportResult,
    reportConfig,
    sectionConfigs,
    allVisualPaths,
    outputDir
  })

  const mdPath = path.join(outputDir, "report.md")
  if (reportConfig.output.save_intermediate) {
    fs.writeFileSync(mdPath, markdown, "utf-8")
    console.log(`  ✅ report.md saved: ${mdPath}`)
  }

  const marpMarkdown = assembleReportMarp({
    reportResult,
    sectionConfigs,
    allVisualPaths,
    outputDir
  })

  const marpPath = path.join(outputDir, "report.marp.md")
  fs.writeFileSync(marpPath, marpMarkdown, "utf-8")
  console.log(`  ✅ report.marp.md saved: ${marpPath}`)

  // ── PHASE 5: RENDERERS ────────────────────────
  console.log("\n▶ Phase 5 — Rendering output files...")

  const filenameBase = reportConfig.output.filename_template
    .replace("{{name}}", slug)

  if (requestedFormats.includes("docx")) {
    console.log("  Rendering DOCX...")
    const docxPath = path.join(outputDir, `${filenameBase}.docx`)
    await renderDocx({ markdown, outputPath: docxPath, title: input.name, outputDir })
    console.log(`  ✅ ${docxPath}`)
  }

  if (requestedFormats.includes("pdf")) {
    console.log("  Rendering PDF...")
    const pdfPath = path.join(outputDir, `${filenameBase}.pdf`)
    await renderPdf({ markdown, outputPath: pdfPath, title: input.name, outputDir })
    console.log(`  ✅ ${pdfPath}`)
  }

  if (requestedFormats.includes("pptx")) {
    console.log("  Rendering PPTX via Marp...")
    const pptxPath = path.join(outputDir, `${filenameBase}.pptx`)
    await renderPptx({ marpMarkdown, outputPath: pptxPath, outputDir })
    console.log(`  ✅ ${pptxPath}`)
  }
  */

  // ── NEW: CALLING THE SHARED RENDERING PIPELINE ────────────────
  await generateOutputsFromResults({
    reportResult,
    reportConfig,
    requestedFormats,
    outputDir,
    slug
  })
}

/**
 * PHASE 3-5: The Rendering Pipeline
 * Extracted so it can be tested without invoking LLMs.
 */
export async function generateOutputsFromResults(params: {
  reportResult: ReportResult,
  reportConfig: ReportConfig,
  requestedFormats: string[],
  outputDir: string,
  slug: string
}): Promise<void> {
  const { reportResult, reportConfig, requestedFormats, outputDir, slug } = params
  const { report_type, topic } = reportResult

  const allSectionIds = reportConfig.runner.groups.flatMap(g => g.sections)
  const sectionConfigs = loadAllSectionConfigs(report_type, allSectionIds)

  reportResult.all_sections.forEach(s => {
    const icon = s.status === "fulfilled" ? "✅"
      : s.status === "placeholder" ? "⚠️ "
      : "❌ "
    console.log(`  ${icon} ${s.title}`)
  })

  // ── PHASE 3: CHARTS & DIAGRAMS ────────────────
  console.log("\n▶ Phase 3 — Rendering charts and diagrams...")
  const allVisualPaths: Record<string, Record<string, string>> = {}

  for (const sectionResult of reportResult.all_sections) {
    if (sectionResult.status !== "fulfilled" || !sectionResult.data) continue

    const sectionConfig: SectionConfig = sectionConfigs[sectionResult.sectionId]
    if (!sectionConfig) continue

    const hasCharts = sectionConfig.charts && sectionConfig.charts.length > 0
    const hasMermaid = sectionConfig.mermaid?.output_field &&
      sectionResult.data[sectionConfig.mermaid.output_field]

    if (!hasCharts && !hasMermaid) continue

    console.log(`  Rendering visuals for: ${sectionConfig.title}`)

    const visualPaths = await renderSectionVisuals({
      sectionId: sectionResult.sectionId,
      sectionData: sectionResult.data,
      chartConfigs: sectionConfig.charts ?? [],
      mermaidOutputField: sectionConfig.mermaid?.output_field ?? null,
      outputDir
    })

    allVisualPaths[sectionResult.sectionId] = visualPaths
  }

  // ── PHASE 4: MARKDOWN ─────────────────────────
  console.log("\n▶ Phase 4 — Assembling markdown...")

  const markdown = assembleReportMarkdown({
    reportResult,
    reportConfig,
    sectionConfigs,
    allVisualPaths,
    outputDir
  })

  const mdPath = path.join(outputDir, "report.md")
  if (reportConfig.output.save_intermediate) {
    fs.writeFileSync(mdPath, markdown, "utf-8")
    console.log(`  ✅ report.md saved: ${mdPath}`)
  }

  // ── PHASE 2.5: SMART SLIDE ASSEMBLY ────────────────
  console.log("\n▶ Phase 2.5 — Planning smart slides via AI...")
  let marpMarkdown = ""
  
  // Toggle for AI planning
  const useAIPlanner = process.env.ENABLE_AI_SLIDES === "true"

  if (useAIPlanner) {
    const llmClient = new GeminiClient()
    const slideParts: string[] = []
    
    // Frontmatter
    slideParts.push("---\nmarp: true\ntheme: aganitha_ppt\npaginate: true\n---\n")
    
    // Cover Slide
    const generatedDate = new Date(reportResult.generated_at).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    })
    slideParts.push(`<!-- _class: cover -->\n\n![Logo width:200px](https://www.aganitha.ai/wp-content/uploads/2023/05/aganitha-logo.png)\n\n# ${reportResult.topic.name}\n\n## Disease Report\n\nPrepared by Aganitha Cognitive Solutions · ${generatedDate}\nConfidential — AI-generated report for internal research use only\n`)

    for (const sectionResult of reportResult.all_sections) {
      const sectionConfig = sectionConfigs[sectionResult.sectionId]
      if (!sectionConfig) continue
      
      console.log(`  Planning slides for: ${sectionConfig.title}`)
      const sectionMarp = await planSlidesForSection({
        sectionConfig,
        sectionResult,
        visualPaths: allVisualPaths[sectionResult.sectionId] ?? {},
        llmClient
      })
      slideParts.push(`---\n\n${sectionMarp}`)
    }
    
    marpMarkdown = slideParts.join("\n")
  } else {
    console.log("  (Skipping AI planning, using legacy builder)")
    /*
    // ORIGINAL MARP ASSEMBLY (Preserved)
    marpMarkdown = assembleReportMarp({
      reportResult,
      sectionConfigs,
      allVisualPaths,
      outputDir
    })
    */
    marpMarkdown = assembleReportMarp({
      reportResult,
      sectionConfigs,
      allVisualPaths,
      outputDir
    })
  }

  const marpPath = path.join(outputDir, "report.marp.md")
  fs.writeFileSync(marpPath, marpMarkdown, "utf-8")
  console.log(`  ✅ report.marp.md saved: ${marpPath}`)

  // ── PHASE 5: RENDERERS ────────────────────────
  console.log("\n▶ Phase 5 — Rendering output files...")

  const filenameBase = reportConfig.output.filename_template
    .replace("{{name}}", slug)

  if (requestedFormats.includes("docx")) {
    console.log("  Rendering DOCX...")
    const docxPath = path.join(outputDir, `${filenameBase}.docx`)
    await renderDocx({ markdown, outputPath: docxPath, title: topic.name, outputDir })
    console.log(`  ✅ ${docxPath}`)
  }

  if (requestedFormats.includes("pdf")) {
    console.log("  Rendering PDF...")
    const pdfPath = path.join(outputDir, `${filenameBase}.pdf`)
    await renderPdf({ markdown, outputPath: pdfPath, title: topic.name, outputDir })
    console.log(`  ✅ ${pdfPath}`)
  }

  if (requestedFormats.includes("pptx")) {
    console.log("  Rendering PPTX via Marp...")
    const pptxPath = path.join(outputDir, `${filenameBase}.pptx`)
    await renderPptx({ marpMarkdown, outputPath: pptxPath, outputDir })
    console.log(`  ✅ ${pptxPath}`)
  }

  // ── DONE ──────────────────────────────────────
  console.log(`\n═══════════════════════════════════════`)
  console.log(`  ✅ Report complete`)
  console.log(`  Output: ${outputDir}`)
  console.log(`═══════════════════════════════════════\n`)
}

