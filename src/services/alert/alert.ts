import type { Article } from '../../shared/types';

export function logArticles(articles: Article[]): void {
  for (const article of articles) {
    console.log(`[BREAKING] ${article.title} — ${article.source.name} (${article.publishedAt})`);
  }
}
