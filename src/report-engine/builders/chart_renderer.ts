import fs from "fs"
import path from "path"
import { ChartConfiguration } from "chart.js"
import { ChartJSNodeCanvas } from "chartjs-node-canvas"
import { ChartConfig } from "../types.js"
import { execSync } from "child_process"

const CHART_WIDTH = 800
const CHART_HEIGHT = 450

const renderer = new ChartJSNodeCanvas({
  width: CHART_WIDTH,
  height: CHART_HEIGHT,
  backgroundColour: "white"
})

// ─────────────────────────────────────────────
// CHART.JS RENDERING
// ─────────────────────────────────────────────

function buildChartConfig(
  chartConfig: ChartConfig,
  data: Record<string, unknown>[]
): ChartConfiguration {
  const labels = data.map(d => String(d[chartConfig.x] ?? ""))
  const values = data.map(d => Number(d[chartConfig.y] ?? 0))

  const COLORS = [
    "#4C9BE8", "#6DD6A2", "#F6B44B",
    "#E8706A", "#A78BFA", "#34D399",
    "#FB923C", "#60A5FA", "#F472B6", "#A3E635"
  ]

  switch (chartConfig.type) {
    case "bar":
      return {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: chartConfig.title,
            data: values,
            backgroundColor: COLORS.slice(0, values.length),
            borderColor: COLORS.slice(0, values.length),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: chartConfig.title,
              font: { size: 16, weight: "bold" },
              padding: { bottom: 16 }
            },
            subtitle: chartConfig.caption
              ? {
                  display: true,
                  text: chartConfig.caption,
                  font: { size: 12 },
                  color: "#666",
                  padding: { bottom: 12 }
                }
              : undefined
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#f0f0f0" }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      }

    case "pie":
      return {
        type: "pie",
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: COLORS.slice(0, values.length),
            borderWidth: 2,
            borderColor: "#fff"
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true,
              position: "right"
            },
            title: {
              display: true,
              text: chartConfig.title,
              font: { size: 16, weight: "bold" },
              padding: { bottom: 16 }
            }
          }
        }
      }

    case "line":
      return {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: chartConfig.title,
            data: values,
            borderColor: "#4C9BE8",
            backgroundColor: "rgba(76, 155, 232, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "#4C9BE8"
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: chartConfig.title,
              font: { size: 16, weight: "bold" },
              padding: { bottom: 16 }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#f0f0f0" }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      }

    default:
      throw new Error(`Unsupported chart type: ${chartConfig.type}`)
  }
}

export async function renderChart(params: {
  chartConfig: ChartConfig
  sectionId: string
  data: Record<string, unknown>[]
  outputDir: string
}): Promise<string> {
  const { chartConfig, sectionId, data, outputDir } = params

  if (!data || data.length === 0) {
    console.warn(`[chart] No data for chart "${chartConfig.id}" in "${sectionId}"`)
    return ""
  }

  const config = buildChartConfig(chartConfig, data)
  const buffer = await renderer.renderToBuffer(config)

  const chartsDir = path.join(outputDir, "charts")
  fs.mkdirSync(chartsDir, { recursive: true })

  const filename = `${sectionId}_${chartConfig.id}.png`
  const filepath = path.join(chartsDir, filename)

  fs.writeFileSync(filepath, buffer)
  console.log(`[chart] Rendered: ${filepath}`)

  return filepath
}

// ─────────────────────────────────────────────
// MERMAID RENDERING
// ─────────────────────────────────────────────

export async function renderMermaid(params: {
  mermaidSyntax: string
  sectionId: string
  outputDir: string
}): Promise<string> {
  const { mermaidSyntax, sectionId, outputDir } = params

  if (!mermaidSyntax || mermaidSyntax.trim() === "") {
    console.warn(`[mermaid] Empty diagram for "${sectionId}" — skipping`)
    return ""
  }

  const chartsDir = path.join(outputDir, "charts")
  fs.mkdirSync(chartsDir, { recursive: true })

  const inputFile = path.join(chartsDir, `${sectionId}_diagram.mmd`)
  const outputFile = path.join(chartsDir, `${sectionId}_diagram.png`)

  fs.writeFileSync(inputFile, mermaidSyntax, "utf-8")

  try {
    // Note: When using npx with a package that has a single binary, 
    // you don't always need to repeat the binary name if it's the same as the package suffix.
    // However, the safest way is often 'npx mmdc' if it's already in devDependencies.
    const cmd = `npx --yes @mermaid-js/mermaid-cli -i "${inputFile}" -o "${outputFile}"`
    console.log(`[mermaid] Running: ${cmd}`)
    
    execSync(cmd, { stdio: "pipe" })
    console.log(`[mermaid] Rendered: ${outputFile}`)
    return outputFile
  } catch (err) {
    console.warn(`[mermaid] Failed to render diagram for "${sectionId}": ${err}`)
    return ""
  }
}

// ─────────────────────────────────────────────
// ORCHESTRATOR — runs all charts for a section
// ─────────────────────────────────────────────

export async function renderSectionVisuals(params: {
  sectionId: string
  sectionData: Record<string, unknown>
  chartConfigs: ChartConfig[] | null
  mermaidOutputField: string | null
  outputDir: string
}): Promise<Record<string, string>> {
  const { sectionId, sectionData, chartConfigs, mermaidOutputField, outputDir } = params
  const paths: Record<string, string> = {}

  // render charts
  if (chartConfigs && chartConfigs.length > 0) {
    for (const chartConfig of chartConfigs) {
      const rawData = sectionData[chartConfig.source_field]

      if (!Array.isArray(rawData)) {
        console.warn(`[chart] Field "${chartConfig.source_field}" is not an array — skipping`)
        continue
      }

      const chartPath = await renderChart({
        chartConfig,
        sectionId,
        data: rawData as Record<string, unknown>[],
        outputDir
      })

      if (chartPath) {
        paths[chartConfig.id] = chartPath
      }
    }
  }

  // render mermaid diagram
  if (mermaidOutputField) {
    const mermaidSyntax = sectionData[mermaidOutputField]

    if (typeof mermaidSyntax === "string" && mermaidSyntax.trim()) {
      const mermaidPath = await renderMermaid({
        mermaidSyntax,
        sectionId,
        outputDir
      })

      if (mermaidPath) {
        paths["mermaid_diagram"] = mermaidPath
      }
    }
  }

  return paths
}
