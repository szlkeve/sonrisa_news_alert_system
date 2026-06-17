import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 60_000;

if (!NEWSAPI_KEY) {
  console.error('Missing NEWSAPI_KEY in environment');
  process.exit(1);
}

type Article = {
  title: string;
  url: string;
  source: { name: string };
  publishedAt: string;
};

type NewsApiResponse = {
  articles: Article[];
};

const seen = new Set<string>();

async function poll(): Promise<void> {
  try {
    const { data } = await axios.get<NewsApiResponse>(
      'https://newsapi.org/v2/top-headlines',
      {
        params: { q: 'breaking', language: 'en', pageSize: 20 },
        headers: { 'X-Api-Key': NEWSAPI_KEY },
      }
    );

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

poll();
setInterval(poll, POLL_INTERVAL_MS);
