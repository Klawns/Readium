import {
  getConnectionMode,
  type ConnectionMode,
} from '@/features/preferences/application/services/connection-mode-service.ts';
import type { InsightsRepository } from '../domain/ports/InsightsRepository';
import type { InsightsUseCases } from '../application/use-cases/insight-use-case-factory';
import { createInsightsUseCases } from '../application/use-cases/insight-use-case-factory';
import { InsightsHttpRepository } from './api/insights-http-repository';
import { InsightsLocalRepository } from './local/insights-local-repository';

const useCasesByMode = new Map<ConnectionMode, InsightsUseCases>();

const resolveRepositoryForMode = (mode: ConnectionMode): InsightsRepository =>
  mode === 'LOCAL' ? new InsightsLocalRepository() : new InsightsHttpRepository();

export const getInsightsUseCases = (): InsightsUseCases => {
  const mode = getConnectionMode();
  const existing = useCasesByMode.get(mode);
  if (existing) {
    return existing;
  }

  const created = createInsightsUseCases(resolveRepositoryForMode(mode));
  useCasesByMode.set(mode, created);
  return created;
};
