import type {
  CreateAnnotationCommand,
  UpdateAnnotationCommand,
} from '@/features/reader/domain/ports/AnnotationRepository';
import type { ReaderAnnotation } from '@/features/reader/domain/models';
import { offlineBooksDb } from '../../infrastructure/storage/offline-books-db';
import { nowIso } from './offline-time';
import {
  createLocalAnnotationRecord,
  toReaderAnnotation,
  toSyncedLocalAnnotationRecord,
} from './offline-annotation-local-mapper';

const generateNextLocalAnnotationId = async (): Promise<number> => {
  const negativeIds = await offlineBooksDb.annotationsLocal.where('localId').below(0).toArray();
  if (negativeIds.length === 0) {
    return -1;
  }

  const minId = negativeIds.reduce((smallest, item) => Math.min(smallest, item.localId), -1);
  return minId - 1;
};

export const createPendingLocalAnnotation = async (
  command: CreateAnnotationCommand,
): Promise<ReaderAnnotation> => {
  const localId = await generateNextLocalAnnotationId();
  const record = createLocalAnnotationRecord(localId, command);
  await offlineBooksDb.annotationsLocal.put(record);
  return toReaderAnnotation(record);
};

export const updateLocalAnnotation = async (
  command: UpdateAnnotationCommand,
): Promise<ReaderAnnotation | null> => {
  const existing = await offlineBooksDb.annotationsLocal.get(command.id);
  if (!existing) {
    return null;
  }

  const updatedRecord = {
    ...existing,
    color: command.color ?? existing.color,
    note: command.note ?? existing.note,
    updatedAt: nowIso(),
    syncStatus: 'PENDING' as const,
  };

  await offlineBooksDb.annotationsLocal.put(updatedRecord);
  return toReaderAnnotation(updatedRecord);
};

export const markLocalAnnotationPendingDelete = async (localId: number): Promise<void> => {
  const existing = await offlineBooksDb.annotationsLocal.get(localId);
  if (!existing) {
    return;
  }

  await offlineBooksDb.annotationsLocal.put({
    ...existing,
    deletedAt: nowIso(),
    updatedAt: nowIso(),
    syncStatus: 'PENDING',
  });
};

export const removeLocalAnnotation = async (localId: number): Promise<void> => {
  await offlineBooksDb.annotationsLocal.delete(localId);
};

export const replaceLocalAnnotationWithSynced = async (
  localId: number,
  remoteAnnotation: ReaderAnnotation,
): Promise<void> => {
  const syncedRecord = toSyncedLocalAnnotationRecord(remoteAnnotation);

  await offlineBooksDb.transaction('rw', offlineBooksDb.annotationsLocal, async () => {
    if (localId !== syncedRecord.localId) {
      await offlineBooksDb.annotationsLocal.delete(localId);
    }
    await offlineBooksDb.annotationsLocal.put(syncedRecord);
  });
};

export const syncLocalAnnotationsFromRemote = async (
  bookId: number,
  remoteAnnotations: ReaderAnnotation[],
): Promise<void> => {
  const remoteById = new Map(remoteAnnotations.map((annotation) => [annotation.id, annotation]));

  await offlineBooksDb.transaction('rw', offlineBooksDb.annotationsLocal, async () => {
    const localRecords = await offlineBooksDb.annotationsLocal.where('bookId').equals(bookId).toArray();

    for (const localRecord of localRecords) {
      const remoteId = localRecord.remoteId ?? (localRecord.localId > 0 ? localRecord.localId : null);
      const isPendingLocalChange = localRecord.syncStatus === 'PENDING';
      if (isPendingLocalChange || remoteId == null) {
        continue;
      }

      if (!remoteById.has(remoteId)) {
        await offlineBooksDb.annotationsLocal.delete(localRecord.localId);
      }
    }

    for (const remoteAnnotation of remoteAnnotations) {
      const localRecord = await offlineBooksDb.annotationsLocal.get(remoteAnnotation.id);
      if (localRecord?.syncStatus === 'PENDING') {
        continue;
      }
      await offlineBooksDb.annotationsLocal.put(toSyncedLocalAnnotationRecord(remoteAnnotation));
    }
  });
};
