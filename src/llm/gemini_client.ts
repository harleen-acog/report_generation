import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { LLMClient } from "./llm_types.js";
import { getApiKey } from "../config/store.js";

export class GeminiClient implements LLMClient {
  private model;

  constructor() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || getApiKey();

    if (!apiKey) {
      throw new Error("Missing API key. Run: author-cli config:set <your_key>");
    }

    // set env for SDK
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    this.model = google("gemini-flash-latest");
  }

  // simple text response
  async generateText(prompt: string): Promise<string> {
    const result = await generateText({
      model: this.model,
      prompt,
    });

    return result.text;
  }

  // structured response
  async generateObject<T>(prompt: string, schema: any): Promise<T> {
    const result = await generateObject({
      model: this.model,
      schema,
      prompt,
    });

    return result.object as T;
  }
}

