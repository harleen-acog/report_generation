// ─────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────

export type ReportInput = {
  name: string
  description?: string
  depth?: string
  style?: string
  author?: string
  [key: string]: string | undefined
}

// ─────────────────────────────────────────────
// REPORT CONFIG  (report.config.json)
// ─────────────────────────────────────────────

export type InputFieldConfig = {
  name: string
  flag: string
  required: boolean
  description: string
  default?: string
  options?: string[]
}

export type OutputConfig = {
  formats: string[]
  output_dir: string
  filename_template: string
  save_intermediate: boolean
}

export type GroupConfig = {
  name: string
  description?: string
  mode: "parallel" | "sequential"
  pauseAfterMs: number
  sections: string[]
}

export type RetryConfig = {
  max_retries: number
  backoff_ms: number[]
  on_exhausted: "placeholder" | "fail"
}

export type ContextConfig = {
  enabled: boolean
  max_words?: number
  style?: "bullet" | "prose" | "none"
}

export type RunnerConfig = {
  groups: GroupConfig[]
  retry: RetryConfig
  context: ContextConfig
}

export type ReportConfig = {
  report_type: string
  version: string
  description: string
  input: { fields: InputFieldConfig[] }
  output: OutputConfig
  runner: RunnerConfig
}

// ─────────────────────────────────────────────
// SECTION CONFIG  (e.g. epidemiology.json)
// ─────────────────────────────────────────────

export type FieldProperty = {
  type: string
  description?: string
  example?: unknown
}

export type StructuredField = {
  name: string
  type: string
  required: boolean
  description: string
  items?: string | {
    type: string
    properties?: Record<string, string>
    description?: string
  }
  properties?: Record<string, FieldProperty>
  example?: unknown
}

export type FreetextField = {
  name: string
  required: boolean
  description: string
  min_words?: number
  max_words?: number
}

export type ChartConfig = {
  id: string
  type: "bar" | "line" | "pie"
  source_field: string
  x: string
  y: string
  title?: string
  caption?: string
}

export type MermaidConfig = {
  authored_by: "llm" | "code"
  required: boolean
  instruction: string
  output_field: string
  fallback?: string
}

export type RenderConfig = {
  docx?: string
  pdf?: string
  marp?: string
}

export type ValidationConfig = {
  required_fields: string[]
  min_array_length?: Record<string, number>
  on_failure: "placeholder" | "fail"
}

export type PromptHints = {
  tone?: string
  avoid?: string[]
  prefer?: string[]
}

export type ContextOutput = {
  include_in_summary: boolean
  summary_fields?: string[]
  summary_style?: string
}

export type SectionConfig = {
  section: string
  title: string
  group: number
  mode: "structured" | "freetext" | "hybrid"
  slide_budget: number

  render: RenderConfig

  context_output: ContextOutput

  structured_fields: StructuredField[]
  freetext_fields: FreetextField[]

  charts?: ChartConfig[]
  mermaid?: MermaidConfig

  validation: ValidationConfig
  prompt_hints: PromptHints
}

// ─────────────────────────────────────────────
// RUNNER RESULTS
// ─────────────────────────────────────────────

export type SectionResult = {
  status: "fulfilled" | "rejected" | "placeholder"
  sectionId: string
  title: string
  data?: Record<string, unknown>
  error?: string
}

export type GroupResult = {
  groupName: string
  results: SectionResult[]
}

export type ReportResult = {
  report_type: string
  topic: ReportInput
  groups: GroupResult[]
  all_sections: SectionResult[]
  generated_at: string
}