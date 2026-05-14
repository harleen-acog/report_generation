import path from "path";
import fs from "fs";
import { generateOutputsFromResults } from "../../report-engine/index.js";
import { mockReportResult } from "./mock_report_data.js";
import { loadReportConfig } from "../../report-engine/config_loader.js";

// Set this to true to test Phase 2.5 (Smart AI Slides)
process.env.ENABLE_AI_SLIDES = "true";
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "AIzaSyDWKjl2J5ZUtb1s37QHSa8M1-98WWUBDBU";

async function runTest() {
  const report_type = "disease_report";
  const reportConfig = loadReportConfig(report_type);
  
  // Set formats to test
  const requestedFormats = ["docx", "pdf", "pptx"];
  
  const slug = "test-lupus-report";
  // Create a separate test_output directory
  const outputDir = path.resolve(process.cwd(), "test_output", slug);
  
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("Starting Workflow Test (Bypassing LLM)...");
  console.log(`Output Directory: ${outputDir}`);

  try {
    await generateOutputsFromResults({
      reportResult: mockReportResult,
      reportConfig,
      requestedFormats,
      outputDir,
      slug
    });
    
    console.log("\nSUCCESS: All renders completed.");
    console.log("Check the 'test_output/test-lupus-report' directory for results.");
  } catch (error) {
    console.error("\nFAILURE: Rendering pipeline failed:", error);
    process.exit(1);
  }
}

runTest();
