import * as dotenv from 'dotenv';
import { createFetcher } from './api';
import type { Article } from '../../shared/types';

dotenv.config();

const apiKey = process.env.NEWSAPI_KEY;

if (!apiKey) {
  throw new Error('NEWSAPI_KEY must be set in .env to run integration tests');
}

jest.setTimeout(15_000);

const fetcher = createFetcher(apiKey);

describe('NewsAPI integration', () => {
  it('returns up to 20 articles', async () => {
    const data = await fetcher();
    expect(data.articles.length).toBeGreaterThanOrEqual(1);
    expect(data.articles.length).toBeLessThanOrEqual(20);
  });

  it('each article has the required fields with correct types', async () => {
    const data = await fetcher();
    for (const article of data.articles) {
      const a = article as Article;
      expect(typeof a.title).toBe('string');
      expect(typeof a.url).toBe('string');
      expect(typeof a.publishedAt).toBe('string');
      expect(typeof a.source?.name).toBe('string');
    }
  });

  it('publishedAt is a valid ISO date string', async () => {
    const data = await fetcher();
    for (const article of data.articles) {
      expect(new Date(article.publishedAt).getTime()).not.toBeNaN();
    }
  });
});
