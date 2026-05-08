// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export function loadPrompt(file: string): string {
//   const filePath = path.resolve(__dirname, "../prompts", file);

//   if (!fs.existsSync(filePath)) {
//     throw new Error(`Prompt file not found: ${file} at ${filePath}`);
//   }

//   return fs.readFileSync(filePath, "utf-8");
// }
import { prompts } from "./prompts.js";

export function loadPrompt(file: keyof typeof prompts) {
  return prompts[file];
}

export function fillTemplate(
  template: string,
  data: Record<string, string>
) {
  let output = template;

  for (const key in data) {
    //check for replace all
    output = output.replaceAll(`{{${key}}}`, data[key]);
  }

  return output;
}