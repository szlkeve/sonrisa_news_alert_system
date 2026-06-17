import { createSlackAlerter } from './slack';
import type { Article } from '../../shared/types';

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  title: 'Big News',
  url: 'https://example.com/1',
  source: { name: 'BBC' },
  publishedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const WEBHOOK_URL = 'https://hooks.slack.com/fake';

describe('createSlackAlerter', () => {
  it('does not post for an empty array', async () => {
    const poster = jest.fn();
    await createSlackAlerter(WEBHOOK_URL, poster)([]);
    expect(poster).not.toHaveBeenCalled();
  });

  it('posts once regardless of article count', async () => {
    const poster = jest.fn().mockResolvedValue(undefined);
    await createSlackAlerter(WEBHOOK_URL, poster)([
      makeArticle(),
      makeArticle({ url: 'https://example.com/2' }),
    ]);
    expect(poster).toHaveBeenCalledTimes(1);
  });

  it('posts to the configured webhook URL', async () => {
    const poster = jest.fn().mockResolvedValue(undefined);
    await createSlackAlerter(WEBHOOK_URL, poster)([makeArticle()]);
    expect(poster).toHaveBeenCalledWith(WEBHOOK_URL, expect.any(Object));
  });

  it('includes each article title in the payload', async () => {
    const poster = jest.fn().mockResolvedValue(undefined);
    await createSlackAlerter(WEBHOOK_URL, poster)([
      makeArticle({ title: 'Story A' }),
      makeArticle({ title: 'Story B', url: 'https://example.com/2' }),
    ]);
    const { text } = (poster as jest.Mock).mock.calls[0][1] as { text: string };
    expect(text).toContain('Story A');
    expect(text).toContain('Story B');
  });

  it('propagates poster errors', async () => {
    const poster = jest.fn().mockRejectedValue(new Error('webhook failed'));
    await expect(createSlackAlerter(WEBHOOK_URL, poster)([makeArticle()])).rejects.toThrow('webhook failed');
  });
});
