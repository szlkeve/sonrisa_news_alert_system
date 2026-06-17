import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createEmailAlerter } from './email';
import type { Article } from '../../shared/types';

dotenv.config();

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_TO } = process.env;

if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM || !EMAIL_TO) {
  throw new Error(
    'EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_TO must be set in .env to run email integration tests'
  );
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT) || 587,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

const alerter = createEmailAlerter(transporter, { from: EMAIL_FROM, to: EMAIL_TO });

const article: Article = {
  title: 'Integration Test Article',
  url: 'https://example.com/integration',
  source: { name: 'Test Source' },
  publishedAt: new Date().toISOString(),
};

jest.setTimeout(20_000);

describe('email alerter integration', () => {
  it('sends without error for a single article', async () => {
    await expect(alerter([article])).resolves.toBeUndefined();
  });

  it('sends without error for multiple articles', async () => {
    const articles: Article[] = [
      article,
      { ...article, url: 'https://example.com/integration-2', title: 'Second Article' },
    ];
    await expect(alerter(articles)).resolves.toBeUndefined();
  });

  it('resolves immediately for an empty array without sending', async () => {
    await expect(alerter([])).resolves.toBeUndefined();
  });
});
