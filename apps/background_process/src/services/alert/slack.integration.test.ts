import * as dotenv from 'dotenv';
import axios from 'axios';
import { createSlackAlerter } from './slack';
import type { Article } from '../../shared/types';

dotenv.config();

const { SLACK_WEBHOOK_URL } = process.env;

if (!SLACK_WEBHOOK_URL) {
  throw new Error('SLACK_WEBHOOK_URL must be set in .env to run Slack integration tests');
}

jest.setTimeout(20_000);

const poster = async (url: string, data: object) => { await axios.post(url, data); };
const alerter = createSlackAlerter(SLACK_WEBHOOK_URL, poster);

const article: Article = {
  title: 'Integration Test Article',
  url: 'https://example.com/slack-integration',
  source: { name: 'Test Source' },
  publishedAt: new Date().toISOString(),
};

describe('Slack alerter integration', () => {
  it('sends without error for a single article', async () => {
    await expect(alerter([article])).resolves.toBeUndefined();
  });

  it('sends without error for multiple articles', async () => {
    const articles: Article[] = [
      article,
      { ...article, url: 'https://example.com/slack-integration-2', title: 'Second Article' },
    ];
    await expect(alerter(articles)).resolves.toBeUndefined();
  });

  it('resolves immediately for an empty array without posting', async () => {
    await expect(alerter([])).resolves.toBeUndefined();
  });
});
