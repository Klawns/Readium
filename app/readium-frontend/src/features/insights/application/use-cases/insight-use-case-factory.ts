import { InsightsHttpRepository } from '../../infrastructure/api/insights-http-repository';
import {
  GetBookMetricsUseCase,
  GetBookRecommendationsUseCase,
  GetReadingEvolutionUseCase,
  GetSmartCollectionsUseCase,
} from './insight-use-cases';

const repository = new InsightsHttpRepository();

export const getBookMetricsUseCase = new GetBookMetricsUseCase(repository);
export const getSmartCollectionsUseCase = new GetSmartCollectionsUseCase(repository);
export const getBookRecommendationsUseCase = new GetBookRecommendationsUseCase(repository);
export const getReadingEvolutionUseCase = new GetReadingEvolutionUseCase(repository);
