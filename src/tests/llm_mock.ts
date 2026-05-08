import { LLMClient } from "../llm/llm_types.js";

export class MockClient implements LLMClient {
  async generateText(): Promise<string> {
    return "Mock summary text";
  }

  async generateObject(): Promise<any> {
    return {
      author_summary: "Mock author summary",
      books: [
        { title: "Mock Book", description: "Mock description" }
      ]
    };
  }
}