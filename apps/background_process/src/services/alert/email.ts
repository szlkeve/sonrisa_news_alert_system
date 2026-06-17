import type { Transporter } from 'nodemailer';
import type { AlertService, Article } from '../../shared/types';

export type EmailConfig = {
  from: string;
  to: string;
};

export function createEmailAlerter(transporter: Transporter, config: EmailConfig): AlertService {
  return async (articles: Article[]) => {
    if (articles.length === 0) return;
    const body = articles
      .map((a) => `[BREAKING] ${a.title} — ${a.source.name} (${a.publishedAt})`)
      .join('\n');
    await transporter.sendMail({
      from: config.from,
      to: config.to,
      subject: `${articles.length} breaking news alert(s)`,
      text: body,
    });
  };
}
