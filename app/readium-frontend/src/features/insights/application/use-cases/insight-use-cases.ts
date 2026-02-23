import type { BookMetrics, BookRecommendation, ReadingEvolutionPoint, SmartCollection } from '@/types';
import type { InsightsRepository } from '../../domain/ports/InsightsRepository';

export class GetBookMetricsUseCase {
  constructor(private readonly repository: InsightsRepository) {}

  execute(): Promise<BookMetrics> {
    return this.repository.getMetrics();
  }
}

export class GetSmartCollectionsUseCase {
  constructor(private readonly repository: InsightsRepository) {}

  execute(): Promise<SmartCollection[]> {
    return this.repository.getSmartCollections();
  }
}

export class GetBookRecommendationsUseCase {
  constructor(private readonly repository: InsightsRepository) {}

  execute(limit = 6): Promise<BookRecommendation[]> {
    return this.repository.getRecommendations(limit);
  }
}

export class GetReadingEvolutionUseCase {
  constructor(private readonly repository: InsightsRepository) {}

  execute(days = 30): Promise<ReadingEvolutionPoint[]> {
    return this.repository.getEvolution(days);
  }
}
