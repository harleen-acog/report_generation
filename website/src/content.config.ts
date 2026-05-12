import { defineCollection} from "astro:content";
import {z} from "zod";
import { glob } from "astro/loaders";
import path from "path";

const books = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: path.resolve(process.cwd(), "../generated/books"),
  }),

  schema: z.object({
    title: z.string(),
    author: z.string(),
    summary: z.string().optional(),
    themes: z.array(z.string()).optional(),
    keyPoints: z.array(z.string()).optional(),
    genres: z.array(z.string()).optional(),
    generatedAt: z.coerce.date().optional(),
    relatedBooks:z.array(z.string()).optional(),
  }),
});

export const collections = { books };