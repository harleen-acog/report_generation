export type Book = {
  id: string;                
  title: string;
  author: string;
  editionCount: number;
  subjects: string[];
  coverImage?: string;       
  firstPublishYear?: number;
  description?: string;     
};