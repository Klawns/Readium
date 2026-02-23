import type { BookMetrics, BookRecommendation, ReadingEvolutionPoint, SmartCollection } from '@/types';

export interface InsightsRepository {
  getMetrics(): Promise<BookMetrics>;
  getSmartCollections(): Promise<SmartCollection[]>;
  getRecommendations(limit?: number): Promise<BookRecommendation[]>;
  getEvolution(days?: number): Promise<ReadingEvolutionPoint[]>;
}
