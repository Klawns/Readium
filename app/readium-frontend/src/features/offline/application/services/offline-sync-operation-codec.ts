import type { SyncQueueRecord } from '../../domain/offline-sync';

export interface SyncQueueOperation<TPayload = Record<string, unknown>>
  extends Omit<SyncQueueRecord, 'payloadJson'> {
  payload: TPayload;
}

export const createSyncOperationId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `op-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

export const encodeSyncPayload = (payload: unknown): string => JSON.stringify(payload ?? {});

const decodeSyncPayload = <TPayload>(payloadJson: string): TPayload => {
  try {
    return JSON.parse(payloadJson) as TPayload;
  } catch {
    return {} as TPayload;
  }
};

export const toSyncQueueOperation = <TPayload>(
  record: SyncQueueRecord,
): SyncQueueOperation<TPayload> => ({
  operationId: record.operationId,
  entityType: record.entityType,
  entityId: record.entityId,
  operationType: record.operationType,
  payload: decodeSyncPayload<TPayload>(record.payloadJson),
  status: record.status,
  attemptCount: record.attemptCount,
  lastError: record.lastError,
  nextRetryAt: record.nextRetryAt,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});
