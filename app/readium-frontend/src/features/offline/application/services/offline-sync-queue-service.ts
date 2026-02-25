import Dexie from 'dexie';
import type {
  OfflineSyncEntityType,
  OfflineSyncOperationType,
} from '../../domain/offline-sync';
import { offlineBooksDb } from '../../infrastructure/storage/offline-books-db';
import { isoAfterDelay, nowIso } from './offline-time';
import { computeRetryDelayMs } from './offline-sync-retry-policy';
import {
  createSyncOperationId,
  encodeSyncPayload,
  toSyncQueueOperation,
  type SyncQueueOperation,
} from './offline-sync-operation-codec';

export interface EnqueueSyncOperationInput<TPayload> {
  entityType: OfflineSyncEntityType;
  entityId: string;
  operationType: OfflineSyncOperationType;
  payload: TPayload;
}

export const enqueueSyncOperation = async <TPayload>({
  entityType,
  entityId,
  operationType,
  payload,
}: EnqueueSyncOperationInput<TPayload>): Promise<void> => {
  const now = nowIso();

  const existing = await offlineBooksDb.syncQueue
    .where('[entityType+entityId+operationType]')
    .equals([entityType, entityId, operationType])
    .first();

  if (!existing) {
    await offlineBooksDb.syncQueue.put({
      operationId: createSyncOperationId(),
      entityType,
      entityId,
      operationType,
      payloadJson: encodeSyncPayload(payload),
      status: 'PENDING',
      attemptCount: 0,
      lastError: null,
      nextRetryAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return;
  }

  await offlineBooksDb.syncQueue.update(existing.operationId, {
    payloadJson: encodeSyncPayload(payload),
    status: 'PENDING',
    attemptCount: 0,
    lastError: null,
    nextRetryAt: now,
    updatedAt: now,
  });
};

export const listDueSyncOperations = async (): Promise<Array<SyncQueueOperation>> => {
  const now = nowIso();
  const candidates = await offlineBooksDb.syncQueue
    .where('status')
    .anyOf('PENDING', 'FAILED')
    .toArray();

  return candidates
    .filter((item) => item.nextRetryAt <= now)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .map((item) => toSyncQueueOperation(item));
};

export const removeSyncOperation = async (operationId: string): Promise<void> => {
  await offlineBooksDb.syncQueue.delete(operationId);
};

export const clearSyncOperationsByEntity = async (
  entityType: OfflineSyncEntityType,
  entityId: string,
): Promise<void> => {
  const records = await offlineBooksDb.syncQueue
    .where('[entityType+entityId+operationType]')
    .between([entityType, entityId, Dexie.minKey], [entityType, entityId, Dexie.maxKey])
    .toArray();

  if (records.length === 0) {
    return;
  }

  await offlineBooksDb.syncQueue.bulkDelete(records.map((record) => record.operationId));
};

export const clearSyncOperationByType = async (
  entityType: OfflineSyncEntityType,
  entityId: string,
  operationType: OfflineSyncOperationType,
): Promise<void> => {
  const record = await offlineBooksDb.syncQueue
    .where('[entityType+entityId+operationType]')
    .equals([entityType, entityId, operationType])
    .first();

  if (!record) {
    return;
  }

  await offlineBooksDb.syncQueue.delete(record.operationId);
};

export const markSyncOperationFailed = async (
  operationId: string,
  errorMessage: string,
): Promise<void> => {
  const current = await offlineBooksDb.syncQueue.get(operationId);
  if (!current) {
    return;
  }

  const nextAttemptCount = current.attemptCount + 1;
  await offlineBooksDb.syncQueue.update(operationId, {
    status: 'FAILED',
    attemptCount: nextAttemptCount,
    lastError: errorMessage,
    nextRetryAt: isoAfterDelay(computeRetryDelayMs(nextAttemptCount)),
    updatedAt: nowIso(),
  });
};
