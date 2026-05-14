import fs from "fs"
import path from "path"
import { ReportConfig, SectionConfig } from "./types.js"
import { pathlog } from "./index.js"

const CONFIGS_ROOT = path.resolve(process.cwd(), "configs")


export function loadReportConfig(report_type: string): ReportConfig {
  const configPath = path.join(CONFIGS_ROOT, report_type, "report.config.json")

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `No report config found for type "${report_type}". ` +
      `Expected at: ${configPath}`
    )
  }

  const raw = fs.readFileSync(configPath, "utf-8")

  try {
    return JSON.parse(raw) as ReportConfig
  } catch {
    throw new Error(`Failed to parse report config for "${report_type}": invalid JSON`)
  }
}

export function loadSectionConfig(
  report_type: string,
  section_id: string
): SectionConfig {
  const sectionPath = path.join(
    CONFIGS_ROOT,
    report_type,
    `${section_id}.json`
  )
  //debug
  // pathlog({"Section path" :sectionPath, "section id":section_id});
  if (!fs.existsSync(sectionPath)) {
    throw new Error(
      `No section config found for "${section_id}" in "${report_type}". ` +
      `Expected at: ${sectionPath}`
    )
  }

  const raw = fs.readFileSync(sectionPath, "utf-8")

  try {
    return JSON.parse(raw) as SectionConfig
  } catch {
    throw new Error(
      `Failed to parse section config "${section_id}": invalid JSON`
    )
  }
}

export function loadAllSectionConfigs(
  report_type: string,
  section_ids: string[]
): Record<string, SectionConfig> {
  const configs: Record<string, SectionConfig> = {}

  for (const id of section_ids) {
    configs[id] = loadSectionConfig(report_type, id)
  }

  return configs
}

export function getAllSectionIds(report_type: string): string[] {
  const dir = path.join(CONFIGS_ROOT, report_type)

  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".json") && f !== "report.config.json")
    .map(f => f.replace(".json", ""))
}