import { z } from "zod";

export const generatedBookSchema = z.object({
  title: z.string(),

  author: z.string(),

  summary: z.string(),

  themes: z.array(z.string()),

  keyPoints: z.array(z.string()),

  relatedBooks: z.array(z.string()).optional(),

  genres: z.array(z.string()).optional(),
});