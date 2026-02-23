import { httpClient } from './http';
import type { BookMetrics, BookRecommendation, ReadingEvolutionPoint, SmartCollection } from '@/types';
import {
  BookMetricsSchema,
  BookRecommendationListSchema,
  ReadingEvolutionPointListSchema,
  SmartCollectionListSchema,
} from './schemas.ts';

export const insightsApi = {
  getMetrics: async (): Promise<BookMetrics> => {
    const response = await httpClient.get<BookMetrics>('/books/insights/metrics');
    if (response.status >= 400) {
      throw new Error(`Erro ao carregar metricas: ${response.status}`);
    }
    return BookMetricsSchema.parse(response.data);
  },

  getSmartCollections: async (): Promise<SmartCollection[]> => {
    const response = await httpClient.get<SmartCollection[]>('/books/insights/smart-collections');
    if (response.status >= 400) {
      throw new Error(`Erro ao carregar colecoes inteligentes: ${response.status}`);
    }
    return SmartCollectionListSchema.parse(response.data);
  },

  getRecommendations: async (limit = 6): Promise<BookRecommendation[]> => {
    const response = await httpClient.get<BookRecommendation[]>('/books/insights/recommendations', {
      params: { limit },
    });
    if (response.status >= 400) {
      throw new Error(`Erro ao carregar recomendacoes: ${response.status}`);
    }
    return BookRecommendationListSchema.parse(response.data);
  },

  getEvolution: async (days = 30): Promise<ReadingEvolutionPoint[]> => {
    const response = await httpClient.get<ReadingEvolutionPoint[]>('/books/insights/evolution', {
      params: { days },
    });
    if (response.status >= 400) {
      throw new Error(`Erro ao carregar evolucao de leitura: ${response.status}`);
    }
    return ReadingEvolutionPointListSchema.parse(response.data);
  },
};
