import type { Transporter } from 'nodemailer';
import { createEmailAlerter } from './email';
import type { Article } from '../../shared/types';

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  title: 'Big News',
  url: 'https://example.com/1',
  source: { name: 'BBC' },
  publishedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeTransporter = () => {
  const sent: object[] = [];
  const transporter = {
    sendMail: jest.fn().mockImplementation((mail) => {
      sent.push(mail);
      return Promise.resolve({ messageId: 'fake-id' });
    }),
  } as unknown as Transporter;
  return { transporter, sent };
};

const config = { from: 'from@test.com', to: 'to@test.com' };

describe('createEmailAlerter', () => {
  it('does not send for an empty array', async () => {
    const { transporter } = makeTransporter();
    await createEmailAlerter(transporter, config)([]);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it('sends one email for multiple articles', async () => {
    const { transporter } = makeTransporter();
    await createEmailAlerter(transporter, config)([makeArticle(), makeArticle({ url: 'https://example.com/2' })]);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
  });

  it('sends to the configured recipient', async () => {
    const { transporter } = makeTransporter();
    await createEmailAlerter(transporter, config)([makeArticle()]);
    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'from@test.com', to: 'to@test.com' })
    );
  });

  it('includes each article in the email body', async () => {
    const { transporter } = makeTransporter();
    await createEmailAlerter(transporter, config)([
      makeArticle({ title: 'Story A' }),
      makeArticle({ title: 'Story B', url: 'https://example.com/2' }),
    ]);
    const { text } = (transporter.sendMail as jest.Mock).mock.calls[0][0];
    expect(text).toContain('Story A');
    expect(text).toContain('Story B');
  });

  it('propagates transporter errors', async () => {
    const transporter = {
      sendMail: jest.fn().mockRejectedValue(new Error('SMTP failure')),
    } as unknown as Transporter;
    await expect(createEmailAlerter(transporter, config)([makeArticle()])).rejects.toThrow('SMTP failure');
  });
});
