import fs from "fs"
import path from "path"
import { GeminiClient } from "../../llm/gemini_client.js"
import { ReportResult, SectionConfig, SectionResult } from "../types.js"

const PROMPT_PATH = path.resolve("src/report-engine/prompts/slide_designer.prompt.md")

export async function planSlidesForSection(params: {
  sectionConfig: SectionConfig,
  sectionResult: SectionResult,
  visualPaths: Record<string, string>,
  llmClient: GeminiClient
}): Promise<string> {
  const { sectionConfig, sectionResult, visualPaths, llmClient } = params

  if (sectionResult.status !== "fulfilled" || !sectionResult.data) {
    return `## ${sectionConfig.title}\n\n> ⚠️ Data unavailable for this section.`
  }

  const systemPrompt = fs.readFileSync(PROMPT_PATH, "utf-8")
  
  const userPrompt = `
# SECTION: ${sectionConfig.title}
# CONFIG:
${JSON.stringify(sectionConfig, null, 2)}

# DATA:
${JSON.stringify(sectionResult.data, null, 2)}

# VISUALS:
${JSON.stringify(visualPaths, null, 2)}

Please generate the Marp slides for this section.
`

  try {
    const marpContent = await llmClient.generateText(`${systemPrompt}\n\n${userPrompt}`)
    return marpContent.trim()
  } catch (error) {
    console.error(`[slide-planner] Failed for ${sectionConfig.section}:`, error)
    return `## ${sectionConfig.title}\n\n> **Note:** Automated slide design failed.`
  }
}
