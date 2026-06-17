import { poll } from './poller';
import type { NewsApiResponse } from '../shared/types';

const makeArticle = (url: string, title = 'Title', source = 'Source') => ({
  title,
  url,
  source: { name: source },
  publishedAt: '2024-01-01T00:00:00Z',
});

const makeFetcher = (articles: NewsApiResponse['articles']) =>
  (): Promise<NewsApiResponse> => Promise.resolve({ articles });

describe('poll', () => {
  it('returns all articles as new when seen is empty', async () => {
    const fetcher = makeFetcher([makeArticle('https://a.com'), makeArticle('https://b.com')]);
    const { newArticles } = await poll(new Set(), fetcher);
    expect(newArticles.map((a) => a.url)).toEqual(['https://a.com', 'https://b.com']);
  });

  it('excludes already-seen articles', async () => {
    const fetcher = makeFetcher([makeArticle('https://a.com'), makeArticle('https://b.com')]);
    const { newArticles } = await poll(new Set(['https://a.com']), fetcher);
    expect(newArticles.map((a) => a.url)).toEqual(['https://b.com']);
  });

  it('returns empty newArticles when all articles are already seen', async () => {
    const fetcher = makeFetcher([makeArticle('https://a.com')]);
    const { newArticles } = await poll(new Set(['https://a.com']), fetcher);
    expect(newArticles).toEqual([]);
  });

  it('returned seen set contains new article URLs', async () => {
    const fetcher = makeFetcher([makeArticle('https://a.com'), makeArticle('https://b.com')]);
    const { seen } = await poll(new Set(), fetcher);
    expect(seen.has('https://a.com')).toBe(true);
    expect(seen.has('https://b.com')).toBe(true);
  });

  it('does not mutate the input seen set', async () => {
    const initial = new Set(['https://a.com']);
    const fetcher = makeFetcher([makeArticle('https://b.com')]);
    await poll(initial, fetcher);
    expect(initial.has('https://b.com')).toBe(false);
  });

  it('propagates fetcher errors', async () => {
    const fetcher = (): Promise<NewsApiResponse> => Promise.reject(new Error('network error'));
    await expect(poll(new Set(), fetcher)).rejects.toThrow('network error');
  });
});
