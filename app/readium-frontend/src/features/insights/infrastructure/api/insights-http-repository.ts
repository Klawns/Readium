import { httpClient } from '@/services/http';
import {
  BookMetricsSchema,
  BookRecommendationListSchema,
  ReadingEvolutionPointListSchema,
  SmartCollectionListSchema,
} from '@/services/schemas';
import type { BookMetrics, BookRecommendation, ReadingEvolutionPoint, SmartCollection } from '@/types';
import type { InsightsRepository } from '../../domain/ports/InsightsRepository';

export class InsightsHttpRepository implements InsightsRepository {
  async getMetrics(): Promise<BookMetrics> {
    const response = await httpClient.get('/books/insights/metrics');
    return BookMetricsSchema.parse(response.data);
  }

  async getSmartCollections(): Promise<SmartCollection[]> {
    const response = await httpClient.get('/books/insights/smart-collections');
    return SmartCollectionListSchema.parse(response.data);
  }

  async getRecommendations(limit = 6): Promise<BookRecommendation[]> {
    const response = await httpClient.get('/books/insights/recommendations', {
      params: { limit },
    });
    return BookRecommendationListSchema.parse(response.data);
  }

  async getEvolution(days = 30): Promise<ReadingEvolutionPoint[]> {
    const response = await httpClient.get('/books/insights/evolution', {
      params: { days },
    });
    return ReadingEvolutionPointListSchema.parse(response.data);
  }
}
