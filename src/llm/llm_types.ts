export interface LLMClient {
  generateText(prompt: string): Promise<string>;
  generateObject<T>(prompt: string, schema: unknown): Promise<T>;
}