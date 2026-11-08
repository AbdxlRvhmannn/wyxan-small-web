export type SearchResultItem = {
  siteId: string;
  address: string;
  title: string;
  excerpt: string;
  score: number;
};

export type SearchResponse = {
  query: string;
  total: number;
  results: SearchResultItem[];
};
