import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  buildReadingEvolutionContext,
  buildReadingEvolutionSummary,
  mapEvolutionPointsToDailyProgress,
} from '../../application/services/reading-evolution-analytics';
import {
  getBookMetricsUseCase,
  getReadingEvolutionUseCase,
} from '../../application/use-cases/insight-use-case-factory';

const EVOLUTION_DAYS = 30;
const PACE_DAYS = 7;
const CONSISTENCY_DAYS = 14;

export const useReadingEvolutionInsights = () => {
  const metricsQuery = useQuery({
    queryKey: queryKeys.insightsMetrics(),
    queryFn: () => getBookMetricsUseCase.execute(),
    staleTime: 30_000,
  });

  const evolutionQuery = useQuery({
    queryKey: [...queryKeys.insightsRoot(), 'evolution', EVOLUTION_DAYS],
    queryFn: () => getReadingEvolutionUseCase.execute(EVOLUTION_DAYS),
    staleTime: 30_000,
  });

  const dailyProgress = useMemo(
    () => mapEvolutionPointsToDailyProgress(evolutionQuery.data ?? []),
    [evolutionQuery.data],
  );

  const summary = useMemo(() => {
    if (!metricsQuery.data) {
      return null;
    }
    return buildReadingEvolutionSummary(metricsQuery.data, dailyProgress, PACE_DAYS, CONSISTENCY_DAYS);
  }, [dailyProgress, metricsQuery.data]);

  const context = useMemo(() => buildReadingEvolutionContext(dailyProgress), [dailyProgress]);

  return {
    summary,
    context,
    dailyProgress,
    isLoading: metricsQuery.isLoading || evolutionQuery.isLoading,
    isError: metricsQuery.isError || evolutionQuery.isError,
  };
};
