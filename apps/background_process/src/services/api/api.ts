import axios from 'axios';
import type { NewsApiResponse } from '../../shared/types';

export function createFetcher(apiKey: string): () => Promise<NewsApiResponse> {
  return () =>
    axios
      .get<NewsApiResponse>('https://newsapi.org/v2/top-headlines', {
        params: { q: 'breaking', language: 'en', pageSize: 20 },
        headers: { 'X-Api-Key': apiKey },
      })
      .then((r) => r.data);
}
