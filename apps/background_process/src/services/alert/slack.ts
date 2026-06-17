import type { AlertService, Article } from '../../shared/types';

export type Poster = (url: string, data: object) => Promise<void>;

export function createSlackAlerter(webhookUrl: string, poster: Poster): AlertService {
  return async (articles: Article[]) => {
    if (articles.length === 0) return;
    const text = articles
      .map((a) => `*[BREAKING]* ${a.title} — ${a.source.name} (${a.publishedAt})`)
      .join('\n');
    await poster(webhookUrl, { text });
  };
}
