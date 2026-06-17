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

const seen = new Set<string>();
const fetcher = createFetcher(NEWSAPI_KEY);

void poll(seen, fetcher);
setInterval(() => void poll(seen, fetcher), POLL_INTERVAL_MS);
