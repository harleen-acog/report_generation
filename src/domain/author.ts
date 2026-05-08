export type AuthorOverview = {
  author_summary: string;
  books: {
    title: string;
    description: string;
  }[];
};
