import { createLLMClient } from "../../llm/provider_factory.js"
import { buildPrompt } from "../builders/prompt_builder.js"
import { validateSectionResult } from "../builders/section_validator.js"
import { SectionConfig, SectionResult, ReportInput, RetryConfig } from "../types.js"

function pause(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function parseJsonResponse(raw: string): Record<string, unknown> {
  // strip accidental markdown backticks if LLM adds them
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim()

  return JSON.parse(cleaned)
}

export async function runSection(params: {
  section: SectionConfig
  topic: ReportInput
  report_type: string
  context?: string
  retryConfig: RetryConfig
}): Promise<SectionResult> {
  const { section, topic, report_type, context, retryConfig } = params

  // uses your existing GeminiClient (or MockClient if LLM_PROVIDER=mock)
  const client = createLLMClient()

  const prompt = buildPrompt({ report_type, section, topic, context })

  let lastError: unknown

  for (let attempt = 0; attempt <= retryConfig.max_retries; attempt++) {
    try {
      console.log(`[runner] ${section.section} — attempt ${attempt + 1}`)

      const text = await client.generateText(prompt)

      const parsed = parseJsonResponse(text)

      return validateSectionResult(parsed, section)

    } catch (err: unknown) {
      lastError = err

      const is429 =
        err instanceof Error &&
        (err.message.includes("429") || err.message.includes("quota"))

      if (is429 && attempt < retryConfig.max_retries) {
        const waitMs = retryConfig.backoff_ms[attempt] ?? 20000
        console.warn(
          `[runner] ${section.section} — rate limited, retrying in ${waitMs}ms`
        )
        await pause(waitMs)
        continue
      }

      // non-429 or retries exhausted
      break
    }
  }

  console.error(`[runner] ${section.section} — failed after retries`)

  if (retryConfig.on_exhausted === "placeholder") {
    return {
      status: "placeholder",
      sectionId: section.section,
      title: section.title,
      error: lastError instanceof Error ? lastError.message : String(lastError)
    }
  }

  return {
    status: "rejected",
    sectionId: section.section,
    title: section.title,
    error: lastError instanceof Error ? lastError.message : String(lastError)
  }
}