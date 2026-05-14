import { SectionResult, SectionConfig, ContextConfig } from "../types.js"

export function buildContextSummary(
  results: SectionResult[],
  sectionConfigs: Record<string, SectionConfig>,
  contextConfig: ContextConfig
): string {
  if (!contextConfig.enabled) return ""

  const lines: string[] = []

  for (const result of results) {
    if (result.status !== "fulfilled" || !result.data) continue

    const config = sectionConfigs[result.sectionId]
    if (!config?.context_output?.include_in_summary) continue

    const summaryFields = config.context_output.summary_fields ?? []

    for (const field of summaryFields) {
      const value = result.data[field]
      if (!value) continue

      if (Array.isArray(value)) {
        // take first 3 items max to keep context short
        const preview = value.slice(0, 3)
        lines.push(`${result.title} — ${field}: ${preview.join(", ")}`)
      } else if (typeof value === "string") {
        // truncate long strings
        const truncated = value.length > 120
          ? value.slice(0, 120) + "..."
          : value
        lines.push(`${result.title} — ${field}: ${truncated}`)
      } else if (typeof value === "object") {
        // shallow stringify objects
        lines.push(
          `${result.title} — ${field}: ${JSON.stringify(value).slice(0, 120)}`
        )
      }
    }
  }

  return lines.join("\n")
}