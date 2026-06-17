import axios from 'axios';
import * as dotenv from 'dotenv';
import type { NewsApiResponse } from './shared/types';

dotenv.config();

export async function poll(
  seen: Set<string>,
  fetcher: (key: string) => Promise<NewsApiResponse>
): Promise<void> {
  try {
    const data = await fetcher(process.env.NEWSAPI_KEY ?? '');
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

if (require.main === module) {
  const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
  const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 60_000;

  if (!NEWSAPI_KEY) {
    console.error('Missing NEWSAPI_KEY in environment');
    process.exit(1);
  }

  const seen = new Set<string>();
  const fetcher = (key: string): Promise<NewsApiResponse> =>
    axios
      .get<NewsApiResponse>('https://newsapi.org/v2/top-headlines', {
        params: { q: 'breaking', language: 'en', pageSize: 20 },
        headers: { 'X-Api-Key': key },
      })
      .then((r) => r.data);

  poll(seen, fetcher);
  setInterval(() => poll(seen, fetcher), POLL_INTERVAL_MS);
}
