import { AlertService } from "../../shared/types";

export const logArticles: AlertService = async (articles) => {
  for (const article of articles) {
    console.log(`[BREAKING] ${article.title} — ${article.source.name} (${article.publishedAt})`);
  }
};
