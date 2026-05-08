import { GeminiClient } from "./gemini_client.js";
import { LLMClient } from "./llm_types.js";
import { MockClient } from "../tests/llm_mock.js";

export function createLLMClient(): LLMClient {
  const provider = process.env.LLM_PROVIDER;

  if (provider === "mock") return new MockClient();
  return new GeminiClient();
}