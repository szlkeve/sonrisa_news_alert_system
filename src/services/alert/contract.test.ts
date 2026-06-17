import type { Transporter } from 'nodemailer';
import { logArticles } from './alert';
import { createEmailAlerter } from './email';
import type { AlertService, Article } from '../../shared/types';

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  title: 'Contract Test Article',
  url: 'https://example.com/contract',
  source: { name: 'Test Source' },
  publishedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeFakeTransporter = () =>
  ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'fake' }),
  }) as unknown as Transporter;

function testAlertServiceContract(name: string, factory: () => AlertService): void {
  describe(`${name} — AlertService contract`, () => {
    it('resolves for an empty array', async () => {
      await expect(factory()([])).resolves.toBeUndefined();
    });

    it('resolves for a single article', async () => {
      await expect(factory()([makeArticle()])).resolves.toBeUndefined();
    });

    it('resolves for multiple articles', async () => {
      await expect(
        factory()([makeArticle(), makeArticle({ url: 'https://example.com/contract-2' })])
      ).resolves.toBeUndefined();
    });

    it('returns a Promise', () => {
      const result = factory()([]);
      expect(result).toBeInstanceOf(Promise);
    });
  });
}

testAlertServiceContract('logArticles', () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  return logArticles;
});

testAlertServiceContract('createEmailAlerter', () =>
  createEmailAlerter(makeFakeTransporter(), { from: 'from@test.com', to: 'to@test.com' })
);
