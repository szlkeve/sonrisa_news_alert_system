import * as dotenv from 'dotenv';
import { createFetcher } from './services/api';
import { poll } from './poller';

dotenv.config();

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 60_000;

if (!NEWSAPI_KEY) {
  console.error('Missing NEWSAPI_KEY in environment');
  process.exit(1);
}

let seen = new Set<string>();
const fetcher = createFetcher(NEWSAPI_KEY);

async function tick(): Promise<void> {
  try {
    const { newArticles, seen: updatedSeen } = await poll(seen, fetcher);
    seen = updatedSeen;
    for (const article of newArticles) {
      console.log(`[BREAKING] ${article.title} — ${article.source.name} (${article.publishedAt})`);
    }
  } catch (err) {
    console.error('Poll failed:', err instanceof Error ? err.message : err);
  }
}

void tick();
setInterval(() => void tick(), POLL_INTERVAL_MS);
