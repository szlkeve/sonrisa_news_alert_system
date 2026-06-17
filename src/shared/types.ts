export type Article = {
  title: string;
  url: string;
  source: { name: string };
  publishedAt: string;
};

export type NewsApiResponse = {
  articles: Article[];
};
