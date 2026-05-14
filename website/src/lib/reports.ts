import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type ReportType = "disease_report" | "book_report";

export interface ReportMeta {
  slug: string;
  name: string;
  report_type: ReportType;
  generated_at?: string;
  author?: string; // book reports
}

export interface ReportContent {
  meta: ReportMeta;
  content: string; // raw markdown
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  hasChart: boolean;
}

// Root output dir — relative to website, go up to disease-reports/output
const OUTPUT_ROOT = path.resolve(process.cwd(), "../output");

export function getAllReports(): ReportMeta[] {
  const reports: ReportMeta[] = [];

  const reportTypes: ReportType[] = ["disease_report", "book_report"];

  for (const reportType of reportTypes) {
    const typeDir = path.join(OUTPUT_ROOT, reportType);
    if (!fs.existsSync(typeDir)) continue;

    const slugs = fs.readdirSync(typeDir).filter((f) => {
      return fs.statSync(path.join(typeDir, f)).isDirectory();
    });

    for (const slug of slugs) {
      const mdPath = path.join(typeDir, slug, `${slug}.md`);
      const fallbackMdPath = path.join(typeDir, slug, "report.md");

      const filePath = fs.existsSync(mdPath)
        ? mdPath
        : fs.existsSync(fallbackMdPath)
          ? fallbackMdPath
          : null;

      if (!filePath) continue;

      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);

      // extract name from first h1 if not in frontmatter
      const h1Match = raw.match(/^# (.+)$/m);
      const name = data.name || h1Match?.[1] || slug;

      reports.push({
        slug,
        name,
        report_type: reportType,
        generated_at: data.generated_at,
        author: data.author,
      });
    }
  }

  return reports;
}

export function getReport(
  report_type: ReportType,
  slug: string
): ReportContent | null {
  const typeDir = path.join(OUTPUT_ROOT, report_type, slug);

  const mdPath = path.join(typeDir, `${slug}.md`);
  const fallbackMdPath = path.join(typeDir, "report.md");

  const filePath = fs.existsSync(mdPath)
    ? mdPath
    : fs.existsSync(fallbackMdPath)
      ? fallbackMdPath
      : null;

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const h1Match = content.match(/^# (.+)$/m);
  const name = data.name || h1Match?.[1] || slug;

  const sections = parseSections(content);

  return {
    meta: {
      slug,
      name,
      report_type,
      generated_at: data.generated_at,
      author: data.author,
    },
    content,
    sections,
  };
}

export function getReportsByType(report_type: ReportType): ReportMeta[] {
  return getAllReports().filter((r) => r.report_type === report_type);
}

// Parse markdown into sections by ## headings
function parseSections(markdown: string): ReportSection[] {
  const lines = markdown.split("\n");
  const sections: ReportSection[] = [];

  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentTitle) {
        const content = currentLines.join("\n").trim();
        sections.push({
          id: slugify(currentTitle),
          title: currentTitle,
          content,
          hasChart: content.includes("!["),
        });
      }
      currentTitle = line.slice(3).trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  if (currentTitle) {
    const content = currentLines.join("\n").trim();
    sections.push({
      id: slugify(currentTitle),
      title: currentTitle,
      content,
      hasChart: content.includes("!["),
    });
  }

  return sections;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Mock data for development when no output files exist
export function getMockReports(): ReportMeta[] {
  return [
    {
      slug: "asthma",
      name: "Asthma",
      report_type: "disease_report",
      generated_at: new Date().toISOString(),
    },
    {
      slug: "lupus",
      name: "Lupus",
      report_type: "disease_report",
      generated_at: new Date().toISOString(),
    },
    {
      slug: "atomic-habits",
      name: "Atomic Habits",
      report_type: "book_report",
      generated_at: new Date().toISOString(),
      author: "James Clear",
    },
  ];
}
