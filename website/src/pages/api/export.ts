export const prerender = false;

import type { APIRoute } from "astro";
import path from "path";
import fs from "fs/promises";

import { exportDocx } from "../../../../src/export/docxExporter"
import { exportSlides } from "../../../../src/export/exportSlides";

function getBooksDir() {
  return path.resolve(
    process.cwd(),
    "generated/books"
  );
}

export const GET: APIRoute = async ({ request }) =>  {
  const requrl = new URL(request.url);

  const slug = requrl.searchParams.get("slug");
  const format = requrl.searchParams.get("format");
  console.log("slug",slug, "format",format, requrl);

  if (!slug || !format) {
    return new Response(
      "Missing slug or format",
      { status: 400 }
    );
  }

  const title = slug.replace(/-/g, " ");

  let outputPath = "";

  try {
    // ---------------------------
    // DOCX
    // ---------------------------

    if (format === "docx") {
      outputPath =
        await exportDocx({
          title,
        });
    }

    // ---------------------------
    // PDF / PPT / HTML (Marp)
    // ---------------------------

    else {
      outputPath =
        await exportSlides({
          title,
          format,
        });
    }

    const fileBuffer =
      await fs.readFile(outputPath);

    const fileName =
      path.basename(outputPath);

    return new Response(
      fileBuffer,
      {
        headers: {
          "Content-Type":
            "application/octet-stream",

          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      }
    );
  } catch (err) {
    console.error(err);

    return new Response(
      "Export failed",
      { status: 500 }
    );
  }
};