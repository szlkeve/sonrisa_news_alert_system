import type { NewsApiResponse } from './shared/types';

export async function poll(
  seen: Set<string>,
  fetcher: () => Promise<NewsApiResponse>
): Promise<void> {
  try {
    const data = await fetcher();
    for (const article of data.articles) {
      if (!seen.has(article.url)) {
        seen.add(article.url);
        console.log(
          `[BREAKING] ${article.title} — ${article.source.name} (${article.publishedAt})`
        );
      }
    }
  } catch (err) {
    console.error('Poll failed:', err instanceof Error ? err.message : err);
  }
}
