import { logArticles } from './alert';
import type { Article } from '../../shared/types';

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  title: 'Big News',
  url: 'https://example.com/1',
  source: { name: 'BBC' },
  publishedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('logArticles', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('logs nothing for an empty array', () => {
    logArticles([]);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logs one line per article', () => {
    logArticles([makeArticle(), makeArticle({ url: 'https://example.com/2' })]);
    expect(logSpy).toHaveBeenCalledTimes(2);
  });

  it('formats the log line correctly', () => {
    logArticles([makeArticle()]);
    expect(logSpy).toHaveBeenCalledWith(
      '[BREAKING] Big News — BBC (2024-01-01T00:00:00Z)'
    );
  });
});
