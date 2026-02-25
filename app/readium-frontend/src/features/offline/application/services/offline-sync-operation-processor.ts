import type {
  AnnotationCreateQueuePayload,
  AnnotationDeleteQueuePayload,
  AnnotationUpdateQueuePayload,
  UpsertBookStatusQueuePayload,
  UpsertProgressQueuePayload,
} from '../../domain/offline-sync';
import { bookApi } from '@/services/bookApi';
import { AnnotationHttpRepository } from '@/features/reader/infrastructure/api/annotation-http-repository';
import {
  getLocalAnnotationRecord,
  removeLocalAnnotation,
  replaceLocalAnnotationWithSynced,
  toCreateAnnotationFromLocalId,
} from './offline-annotation-store-service';
import { markLocalReadingProgressSynced } from './offline-reading-progress-store-service';
import { updateOfflineBookLastReadPage } from './offline-book-snapshot-service';
import type { SyncQueueOperation } from './offline-sync-operation-codec';
import type { BookStatus } from '@/types';
import {
  isAnnotationHttpStatusError,
} from '@/features/reader/infrastructure/api/annotation-http-repository';
import { toCreateAnnotationCommand } from './offline-annotation-local-mapper';

const annotationRepository = new AnnotationHttpRepository();
const isBookStatus = (status: string): status is BookStatus =>
  status === 'TO_READ' || status === 'READING' || status === 'READ';

const processProgressOperation = async (
  payload: UpsertProgressQueuePayload,
  operationId: string,
): Promise<void> => {
  const safeBookId = Math.floor(payload.bookId);
  const safePage = Number.isFinite(payload.page) ? Math.max(1, Math.floor(payload.page)) : 1;
  if (!Number.isFinite(safeBookId) || safeBookId <= 0) {
    return;
  }

  await bookApi.updateProgress(safeBookId, safePage, {
    keepalive: false,
    operationId,
  });
  await markLocalReadingProgressSynced(safeBookId, safePage);
  await updateOfflineBookLastReadPage(safeBookId, safePage);
};

const processBookStatusOperation = async (
  payload: UpsertBookStatusQueuePayload,
  operationId: string,
): Promise<void> => {
  const safeBookId = Math.floor(payload.bookId);
  if (!Number.isFinite(safeBookId) || safeBookId <= 0) {
    return;
  }
  if (!isBookStatus(payload.status)) {
    return;
  }

  await bookApi.updateBookStatus(safeBookId, payload.status, { operationId });
};

const processAnnotationCreateOperation = async (
  payload: AnnotationCreateQueuePayload,
  operationId: string,
): Promise<void> => {
  const safeLocalId = Math.floor(payload.localId);
  if (!Number.isFinite(safeLocalId)) {
    return;
  }

  const command = await toCreateAnnotationFromLocalId(safeLocalId);
  if (!command) {
    return;
  }

  const remoteAnnotation = await annotationRepository.createWithOperationId(command, operationId);
  await replaceLocalAnnotationWithSynced(safeLocalId, remoteAnnotation);
};

const processAnnotationUpdateOperation = async (
  payload: AnnotationUpdateQueuePayload,
  operationId: string,
): Promise<void> => {
  const safeLocalId = Math.floor(payload.localId);
  if (!Number.isFinite(safeLocalId)) {
    return;
  }

  const localRecord = await getLocalAnnotationRecord(safeLocalId);
  if (!localRecord || localRecord.deletedAt) {
    return;
  }

  const remoteId = localRecord.remoteId ?? (localRecord.localId > 0 ? localRecord.localId : null);
  if (remoteId == null) {
    return;
  }

  try {
    const remoteAnnotation = await annotationRepository.updateWithOperationId({
      id: remoteId,
      color: localRecord.color,
      note: localRecord.note ?? undefined,
    }, operationId);
    await replaceLocalAnnotationWithSynced(localRecord.localId, remoteAnnotation);
  } catch (error: unknown) {
    if (!isAnnotationHttpStatusError(error) || error.status !== 404) {
      throw error;
    }

    const createCommand = toCreateAnnotationCommand(localRecord);
    const recreatedAnnotation = await annotationRepository.createWithOperationId(createCommand, operationId);
    await replaceLocalAnnotationWithSynced(localRecord.localId, recreatedAnnotation);
  }
};

const processAnnotationDeleteOperation = async (
  payload: AnnotationDeleteQueuePayload,
  operationId: string,
): Promise<void> => {
  const safeLocalId = Math.floor(payload.localId);
  if (!Number.isFinite(safeLocalId)) {
    return;
  }

  const localRecord = await getLocalAnnotationRecord(safeLocalId);
  const remoteIdFromLocal = localRecord?.remoteId ?? (localRecord && localRecord.localId > 0 ? localRecord.localId : null);
  const remoteId = remoteIdFromLocal ?? payload.remoteId ?? null;

  if (remoteId != null) {
    try {
      await annotationRepository.deleteWithOperationId(remoteId, operationId);
    } catch (error: unknown) {
      if (!isAnnotationHttpStatusError(error) || error.status !== 404) {
        throw error;
      }
    }
  }

  if (localRecord) {
    await removeLocalAnnotation(localRecord.localId);
  }
};

export const processSyncQueueOperation = async (operation: SyncQueueOperation): Promise<void> => {
  switch (operation.operationType) {
    case 'UPSERT_PROGRESS':
      await processProgressOperation(operation.payload as UpsertProgressQueuePayload, operation.operationId);
      return;
    case 'UPSERT_BOOK_STATUS':
      await processBookStatusOperation(
        operation.payload as UpsertBookStatusQueuePayload,
        operation.operationId,
      );
      return;
    case 'CREATE_ANNOTATION':
      await processAnnotationCreateOperation(
        operation.payload as AnnotationCreateQueuePayload,
        operation.operationId,
      );
      return;
    case 'UPDATE_ANNOTATION':
      await processAnnotationUpdateOperation(
        operation.payload as AnnotationUpdateQueuePayload,
        operation.operationId,
      );
      return;
    case 'DELETE_ANNOTATION':
      await processAnnotationDeleteOperation(
        operation.payload as AnnotationDeleteQueuePayload,
        operation.operationId,
      );
      return;
    default:
      return;
  }
};
