import { insightsApi } from '@/services/insightsApi.ts';
import type { BookMetrics, BookRecommendation, ReadingEvolutionPoint, SmartCollection } from '@/types';
import type { InsightsRepository } from '../../domain/ports/InsightsRepository';

export class InsightsHttpRepository implements InsightsRepository {
  getMetrics(): Promise<BookMetrics> {
    return insightsApi.getMetrics();
  }

  getSmartCollections(): Promise<SmartCollection[]> {
    return insightsApi.getSmartCollections();
  }

  getRecommendations(limit = 6): Promise<BookRecommendation[]> {
    return insightsApi.getRecommendations(limit);
  }

  getEvolution(days = 30): Promise<ReadingEvolutionPoint[]> {
    return insightsApi.getEvolution(days);
  }
}
