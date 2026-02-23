import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  getBookMetricsUseCase,
  getBookRecommendationsUseCase,
  getSmartCollectionsUseCase,
} from '../../application/use-cases/insight-use-case-factory';

interface UseInsightsParams {
  recommendationLimit?: number;
}

export const useInsights = ({ recommendationLimit = 6 }: UseInsightsParams = {}) => {
  const metricsQuery = useQuery({
    queryKey: queryKeys.insightsMetrics(),
    queryFn: () => getBookMetricsUseCase.execute(),
    staleTime: 30_000,
  });

  const smartCollectionsQuery = useQuery({
    queryKey: queryKeys.insightsSmartCollections(),
    queryFn: () => getSmartCollectionsUseCase.execute(),
    staleTime: 30_000,
  });

  const recommendationsQuery = useQuery({
    queryKey: queryKeys.insightsRecommendations(recommendationLimit),
    queryFn: () => getBookRecommendationsUseCase.execute(recommendationLimit),
    staleTime: 30_000,
  });

  return {
    metrics: metricsQuery.data,
    smartCollections: smartCollectionsQuery.data ?? [],
    recommendations: recommendationsQuery.data ?? [],
    isLoading:
      metricsQuery.isLoading || smartCollectionsQuery.isLoading || recommendationsQuery.isLoading,
    isError: metricsQuery.isError || smartCollectionsQuery.isError || recommendationsQuery.isError,
  };
};

