import { loadReportConfig, loadAllSectionConfigs } from "../config_loader.js"
import { runSection } from "./section_runner.js"
import { buildContextSummary } from "../builders/context_builder.js"
import { RetryConfig } from "../types.js"
import {
  ReportInput,
  ReportResult,
  SectionResult,
  GroupResult,
  SectionConfig
} from "../types.js"
import { pathlog } from "../index.js"

function pause(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function runParallel(
  sectionIds: string[],
  sectionConfigs: Record<string, SectionConfig>,
  report_type: string,
  topic: ReportInput,
  context: string,
  retryConfig: RetryConfig
): Promise<SectionResult[]> {
  const settled = await Promise.allSettled(
    sectionIds.map(id =>
      runSection({
        section: sectionConfigs[id],
        topic,
        report_type,
        context,
        retryConfig
      })
    )
  )

  // preserve config order, handle unexpected rejections
  return settled.map((r, i) => {
    if (r.status === "fulfilled") return r.value
    return {
      status: "placeholder" as const,
      sectionId: sectionIds[i],
      title: sectionConfigs[sectionIds[i]].title,
      error: r.reason?.message ?? "Unknown error"
    }
  })
}

async function runSequential(
  sectionIds: string[],
  sectionConfigs: Record<string, SectionConfig>,
  report_type: string,
  topic: ReportInput,
  context: string,
  retryConfig: RetryConfig
): Promise<SectionResult[]> {
  const results: SectionResult[] = []

  for (const id of sectionIds) {
    const result = await runSection({
      section: sectionConfigs[id],
      topic,
      report_type,
      context,
      retryConfig
    })
    results.push(result)
    await pause(3000)
  }

  return results
}

export async function runReport(params: {
  report_type: string
  input: ReportInput
}): Promise<ReportResult> {
  const { report_type, input } = params

  console.log(`\n[report-runner] Starting "${report_type}" report for: ${input.name}`)

  // load configs
  const reportConfig = loadReportConfig(report_type)

  const allSectionIds = reportConfig.runner.groups.flatMap(g => g.sections)
  const sectionConfigs = loadAllSectionConfigs(report_type, allSectionIds)
 
  const retryConfig = reportConfig.runner.retry
  const contextConfig = reportConfig.runner.context

  const allResults: SectionResult[] = []
  const groupResults: GroupResult[] = []

  for (const group of reportConfig.runner.groups) {
    console.log(`\n[report-runner] Running group: ${group.name} (${group.mode})`)

    // build context from all previous results
    const context = buildContextSummary(
      allResults,
      sectionConfigs,
      contextConfig
    )

    if (context) {
      console.log(`[report-runner] Context summary (${context.split("\n").length} lines) passed to group`)
    }

    // run group
    const results = group.mode === "parallel"
      ? await runParallel(
          group.sections,
          sectionConfigs,
          report_type,
          input,
          context,
          retryConfig
        )
      : await runSequential(
          group.sections,
          sectionConfigs,
          report_type,
          input,
          context,
          retryConfig
        )

    groupResults.push({ groupName: group.name, results })
    allResults.push(...results)

    // pause between groups
    if (group.pauseAfterMs > 0) {
      console.log(`[report-runner] Pausing ${group.pauseAfterMs}ms before next group`)
      await pause(group.pauseAfterMs)
    }
  }

  console.log(`\n[report-runner] All groups complete`)

  return {
    report_type,
    topic: input,
    groups: groupResults,
    all_sections: allResults,
    generated_at: new Date().toISOString()
  }
}