import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createLogger } from '@/lib/logger.ts';
import { runOfflineSyncQueue } from '../../application/services/offline-sync-runner-service';

const logger = createLogger('offline-sync');
const bookRootQueryKey = ['book'] as const;

const invalidateAfterSync = async (queryClient: ReturnType<typeof useQueryClient>): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot(), refetchType: 'active' }),
    queryClient.invalidateQueries({ queryKey: bookRootQueryKey, refetchType: 'active' }),
    queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot(), refetchType: 'active' }),
    queryClient.invalidateQueries({ queryKey: ['reader', 'annotations'], refetchType: 'active' }),
  ]);
};

export const useOfflineSyncBootstrap = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const runAndRefresh = async (reason: 'boot' | 'online' | 'visibility'): Promise<void> => {
      const result = await runOfflineSyncQueue();
      if (result.processed > 0) {
        logger.info('offline sync completed', { reason, ...result });
        await invalidateAfterSync(queryClient);
      }
    };

    void runAndRefresh('boot');

    const handleOnline = () => {
      void runAndRefresh('online');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void runAndRefresh('visibility');
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);
};
