import type { BookMetrics, BookRecommendation, SmartCollection } from '@/types';

export interface InsightsRepository {
  getMetrics(): Promise<BookMetrics>;
  getSmartCollections(): Promise<SmartCollection[]>;
  getRecommendations(limit?: number): Promise<BookRecommendation[]>;
}

