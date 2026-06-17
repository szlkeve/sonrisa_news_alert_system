import type { Article, NewsApiResponse } from './shared/types';

type PollResult = {
  newArticles: Article[];
  seen: Set<string>;
};

export async function poll(
  seen: Set<string>,
  fetcher: () => Promise<NewsApiResponse>
): Promise<PollResult> {
  const data = await fetcher();
  const newArticles = data.articles.filter((a) => !seen.has(a.url));
  const updatedSeen = new Set(seen);
  for (const article of newArticles) {
    updatedSeen.add(article.url);
  }
  return { newArticles, seen: updatedSeen };
}
