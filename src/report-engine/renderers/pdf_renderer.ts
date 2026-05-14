import fs from "fs"
import path from "path"
import puppeteer from "puppeteer"
import { marked } from "marked"

// ─────────────────────────────────────────────
// COVER PAGE HTML
// ─────────────────────────────────────────────

function buildCoverHtml(title: string, date: string): string {
  return `
  <div class="cover-page">
    <div class="cover-bg-grid"></div>
    <div class="cover-accent-bar"></div>

    <div class="cover-content">
      <div class="cover-logo-wrap">
        <img
          src="https://www.aganitha.ai/wp-content/uploads/2023/05/aganitha-logo.png"
          alt="Aganitha"
          class="cover-logo"
          onerror="this.style.display='none'"
        />
      </div>

      <div class="cover-body">
        <div class="cover-label">Disease Intelligence Report</div>
        <h1 class="cover-title">${title}</h1>
        <p class="cover-subtitle">Comprehensive Clinical &amp; Market Intelligence</p>
      </div>

      <div class="cover-footer">
        <div class="cover-footer-left">
          <div class="cover-meta-row"><span class="meta-label">Prepared by</span><span class="meta-val">Aganitha Cognitive Solutions</span></div>
          <div class="cover-meta-row"><span class="meta-label">Generated</span><span class="meta-val">${date}</span></div>
          <div class="cover-meta-row"><span class="meta-label">Classification</span><span class="meta-val">Confidential</span></div>
        </div>
        <div class="cover-footer-right">
          <p class="cover-disclaimer">This report is AI-generated and intended for internal research purposes only. Not for distribution.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="page-break"></div>`
}

// ─────────────────────────────────────────────
// MARKDOWN → HTML
// Fixes image paths to absolute file:// URIs so Puppeteer can load them.
// markdown already contains paths relative to outputDir.
// ─────────────────────────────────────────────

function markdownToHtml(markdown: string, title: string, outputDir: string): string {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  })

  // Fix relative image paths → absolute file:// so Puppeteer loads them
  const fixedMarkdown = markdown.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, src) => {
      if (src.startsWith("http") || src.startsWith("file://")) return `![${alt}](${src})`
      const abs = path.isAbsolute(src) ? src : path.resolve(outputDir, src)
      return `![${alt}](file://${abs})`
    }
  )

  const body = marked(fixedMarkdown) as string

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', 'Calibri', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.65;
      color: #1e2d3d;
    }

    /* ── Cover page ── */
    .cover-page {
      width: 100%;
      height: 100vh;
      min-height: 1050px;
      background: linear-gradient(160deg, #060f1e 0%, #0a1f3d 45%, #0d3060 75%, #0f4080 100%);
      position: relative;
      display: flex;
      align-items: stretch;
      overflow: hidden;
    }

    .cover-bg-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 52px 52px;
    }

    .cover-accent-bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, #4c9be8 0%, #7ec8f0 50%, transparent 100%);
    }

    .cover-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 64px 80px 56px;
      width: 100%;
    }

    .cover-logo { height: 36px; width: auto; filter: brightness(0) invert(1); opacity: 0.9; }

    .cover-label {
      font-size: 11pt;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #4c9be8;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .cover-title {
      font-size: 42pt;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }

    .cover-subtitle {
      font-size: 14pt;
      color: rgba(150, 200, 255, 0.7);
      font-weight: 400;
    }

    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid rgba(126, 200, 240, 0.2);
      padding-top: 0px;
      gap: 32px;
    }

    .cover-footer-left { display: flex; flex-direction: column; gap: 6px; }

    .cover-meta-row { display: flex; gap: 12px; }

    .meta-label {
      font-size: 9pt;
      color: rgba(150, 200, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      min-width: 100px;
    }

    .meta-val {
      font-size: 9pt;
      color: rgba(200, 230, 255, 0.85);
      font-weight: 500;
    }

    .cover-footer-right { max-width: 320px; }

    .cover-disclaimer {
      font-size: 8pt;
      color: rgba(150, 200, 255, 0.4);
      line-height: 1.5;
      text-align: right;
    }

    /* ── Page break ── */
    .page-break { page-break-after: always; }

    /* ── Body content ── */
    .content-wrap {
      max-width: 860px;
      margin: 0 auto;
      padding: 48px 64px;
    }

    h1 {
      font-size: 26pt;
      color: #0f2d50;
      border-bottom: 3px solid #4c9be8;
      padding-bottom: 12px;
      margin: 36px 0 20px;
    }

    h2 {
      font-size: 17pt;
      color: #065a82;
      border-bottom: 1px solid #c8dff0;
      padding-bottom: 8px;
      margin: 32px 0 14px;
    }

    h3 {
      font-size: 13pt;
      color: #1c7293;
      margin: 20px 0 8px;
    }

    p { margin-bottom: 12px; }

    ul, ol { padding-left: 24px; margin-bottom: 12px; }
    li { margin-bottom: 4px; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }

    th {
      background: #0f2d50;
      color: white;
      padding: 9px 11px;
      text-align: left;
      font-weight: 600;
    }

    td {
      padding: 7px 11px;
      border-bottom: 1px solid #e4edf5;
    }

    tr:nth-child(even) td { background: #f4f8fc; }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px auto;
      border-radius: 6px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    blockquote {
      border-left: 4px solid #f59e0b;
      padding: 10px 16px;
      color: #7c5a00;
      background: #fffbeb;
      margin: 14px 0;
      border-radius: 0 6px 6px 0;
    }

    hr {
      border: none;
      border-top: 1px solid #c8dff0;
      margin: 28px 0;
    }

    strong { font-weight: 700; }
    em { font-style: italic; }

    @media print {
      .content-wrap { padding: 0; }
    }
  </style>
</head>
<body>
  ${buildCoverHtml(title, generatedDate)}
  <div class="content-wrap">
    ${body}
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────
// MAIN PDF RENDERER
// ─────────────────────────────────────────────

export async function renderPdf(params: {
  markdown: string
  outputPath: string
  title: string
  outputDir: string
}): Promise<void> {
  const { markdown, outputPath, title, outputDir } = params

  const html = markdownToHtml(markdown, title, outputDir)

  const htmlPath = outputPath.replace(".pdf", ".html")
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(htmlPath, html, "utf-8")
  console.log(`[pdf] HTML written: ${htmlPath}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"]
  })

  try {
    const page = await browser.newPage()

    // Use file:// URL so local images load correctly
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" })

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "18mm", bottom: "22mm", left: "18mm" },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:8px; color:#aaa; width:100%; padding: 0 18mm; display:flex; justify-content:space-between;">
          <span>${title} — Disease Intelligence Report</span>
          <span>Aganitha Cognitive Solutions</span>
        </div>`,
      footerTemplate: `
        <div style="font-size:8px; color:#aaa; width:100%; text-align:center; padding: 0 18mm;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          &nbsp;·&nbsp; Confidential
        </div>`
    })

    console.log(`[pdf] Written: ${outputPath}`)
  } finally {
    await browser.close()
  }
}