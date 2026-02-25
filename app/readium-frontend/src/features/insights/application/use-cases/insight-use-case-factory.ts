import type { InsightsRepository } from '../../domain/ports/InsightsRepository';
import {
  GetBookMetricsUseCase,
  GetBookRecommendationsUseCase,
  GetReadingEvolutionUseCase,
  GetSmartCollectionsUseCase,
} from './insight-use-cases';

export interface InsightsUseCases {
  getBookMetricsUseCase: GetBookMetricsUseCase;
  getSmartCollectionsUseCase: GetSmartCollectionsUseCase;
  getBookRecommendationsUseCase: GetBookRecommendationsUseCase;
  getReadingEvolutionUseCase: GetReadingEvolutionUseCase;
}

export const createInsightsUseCases = (repository: InsightsRepository): InsightsUseCases => ({
  getBookMetricsUseCase: new GetBookMetricsUseCase(repository),
  getSmartCollectionsUseCase: new GetSmartCollectionsUseCase(repository),
  getBookRecommendationsUseCase: new GetBookRecommendationsUseCase(repository),
  getReadingEvolutionUseCase: new GetReadingEvolutionUseCase(repository),
});
