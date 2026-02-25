import type {
  OfflineSyncOperationType,
} from '../../domain/offline-sync';
import { createLogger } from '@/lib/logger.ts';
import { isDeviceOnline } from './offline-network-service';
import {
  listDueSyncOperations,
  markSyncOperationFailed,
  removeSyncOperation,
} from './offline-sync-queue-service';
import { processSyncQueueOperation } from './offline-sync-operation-processor';

const logger = createLogger('offline-sync');

let syncInFlight: Promise<OfflineSyncRunResult> | null = null;

export interface OfflineSyncRunResult {
  processed: number;
  succeeded: number;
  failed: number;
}

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return 'Erro desconhecido durante sincronizacao offline.';
};

const isKnownOperationType = (operationType: string): operationType is OfflineSyncOperationType =>
  operationType === 'UPSERT_PROGRESS'
  || operationType === 'UPSERT_BOOK_STATUS'
  || operationType === 'CREATE_ANNOTATION'
  || operationType === 'UPDATE_ANNOTATION'
  || operationType === 'DELETE_ANNOTATION';

const runSyncQueueInternal = async (): Promise<OfflineSyncRunResult> => {
  if (!isDeviceOnline()) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  const operations = await listDueSyncOperations();
  if (operations.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  logger.debug('sync queue start', { operations: operations.length });
  const startedAt = Date.now();
  let succeeded = 0;
  let failed = 0;

  for (const operation of operations) {
    try {
      if (!isKnownOperationType(operation.operationType)) {
        logger.warn('sync operation skipped (unknown type)', {
          operationId: operation.operationId,
          operationType: operation.operationType,
        });
        await removeSyncOperation(operation.operationId);
        continue;
      }

      await processSyncQueueOperation(operation);
      await removeSyncOperation(operation.operationId);
      succeeded += 1;
      logger.debug('sync operation succeeded', {
        operationId: operation.operationId,
        operationType: operation.operationType,
      });
    } catch (error: unknown) {
      failed += 1;
      const message = resolveErrorMessage(error);
      await markSyncOperationFailed(operation.operationId, message);
      logger.warn('sync operation failed', {
        operationId: operation.operationId,
        operationType: operation.operationType,
        error: message,
      });
    }
  }

  const result = {
    processed: operations.length,
    succeeded,
    failed,
  };
  logger.info('sync queue finished', {
    ...result,
    durationMs: Date.now() - startedAt,
  });
  return result;
};

export const runOfflineSyncQueue = async (): Promise<OfflineSyncRunResult> => {
  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = runSyncQueueInternal().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
};
