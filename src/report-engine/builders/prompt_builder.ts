import nunjucks from "nunjucks";
import path from "path"
import { SectionConfig, ReportInput } from "../types.js"
import { pathlog } from "../index.js";

const TEMPLATES_ROOT = path.resolve(process.cwd(), "templates")

export function buildPrompt(params: {
  report_type: string
  section: SectionConfig
  topic: ReportInput
  context?: string
}): string {
  const { report_type, section, topic, context } = params

  // configure nunjucks to load from report type template folder
  const env = nunjucks.configure(
    path.join(TEMPLATES_ROOT, report_type, "prompts"),
    {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true
    }
  )

  const templateFile = `${section.section}.prompt.njk`
  // pathlog("template file", templateFile);
  // pathlog("root for templates",TEMPLATES_ROOT,{"env path joined":path.join(TEMPLATES_ROOT, report_type, "prompts")});

  try {
    return env.render(templateFile, {
      topic,
      disease: topic, // alias for template compatibility
      section,
      context: context || null
    })
  } catch (err) {
    throw new Error(
      `Failed to render prompt template "${templateFile}": ${err}`
    )
  }
}