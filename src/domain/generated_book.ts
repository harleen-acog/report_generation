export type GeneratedBook = {
  slug: string;
  title: string;
  author: string;

  summary: string;

  themes: string[];

  keyPoints: string[];

  relatedBooks?: string[];

  genres?: string[];

  coverImage?: string;

  firstPublishYear?: number;

  generatedAt: string;
};