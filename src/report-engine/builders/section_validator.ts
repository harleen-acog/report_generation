import { SectionConfig, SectionResult } from "../types.js"

export function validateSectionResult(
  raw: Record<string, unknown>,
  config: SectionConfig
): SectionResult {
  const { validation, section, title } = config
  const missing: string[] = []

  // check required fields presence
  for (const field of validation.required_fields) {
    if (raw[field] === undefined || raw[field] === null) {
      missing.push(field)
    }
  }

  // check minimum array lengths
  if (validation.min_array_length) {
    for (const [field, minLen] of Object.entries(validation.min_array_length)) {
      const value = raw[field]
      if (Array.isArray(value) && value.length < minLen) {
        missing.push(`${field} (min ${minLen} items, got ${value.length})`)
      }
    }
  }

  if (missing.length > 0) {
    console.warn(
      `[validator] Section "${section}" missing fields: ${missing.join(", ")}`
    )

    if (validation.on_failure === "fail") {
      return {
        status: "rejected",
        sectionId: section,
        title,
        error: `Validation failed — missing: ${missing.join(", ")}`
      }
    }

    // on_failure: placeholder — still return data with warning
    return {
      status: "placeholder",
      sectionId: section,
      title,
      data: raw,
      error: `Partial data — missing: ${missing.join(", ")}`
    }
  }

  return {
    status: "fulfilled",
    sectionId: section,
    title,
    data: raw
  }
}