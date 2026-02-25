import type {
  CreateAnnotationCommand,
  UpdateAnnotationCommand,
} from '@/features/reader/domain/ports/AnnotationRepository';
import type { ReaderAnnotation } from '@/features/reader/domain/models';
import { isDeviceOnline } from './offline-network-service';
import {
  createPendingLocalAnnotation,
  getLocalAnnotationRecord,
  markLocalAnnotationPendingDelete,
  removeLocalAnnotation,
  replaceLocalAnnotationWithSynced,
  updateLocalAnnotation,
} from './offline-annotation-store-service';
import { upsertOfflineBookSnapshot } from './offline-book-snapshot-service';
import {
  clearAnnotationSyncOperations,
  enqueueAnnotationCreateSync,
  enqueueAnnotationDeleteSync,
  enqueueAnnotationUpdateSync,
  type AnnotationRemoteRepository,
} from './offline-annotation-sync-runtime';
import { isAnnotationHttpStatusError } from '@/features/reader/infrastructure/api/annotation-http-repository';

export const createAnnotationOfflineFirst = async (
  command: CreateAnnotationCommand,
  remoteRepository: AnnotationRemoteRepository,
): Promise<ReaderAnnotation> => {
  await upsertOfflineBookSnapshot({
    id: command.bookId,
    lastReadPage: command.page,
  });

  const localAnnotation = await createPendingLocalAnnotation(command);

  if (!isDeviceOnline()) {
    await enqueueAnnotationCreateSync(localAnnotation.id);
    return localAnnotation;
  }

  try {
    const remoteAnnotation = await remoteRepository.create(command);
    await replaceLocalAnnotationWithSynced(localAnnotation.id, remoteAnnotation);
    await clearAnnotationSyncOperations(localAnnotation.id);
    return remoteAnnotation;
  } catch {
    await enqueueAnnotationCreateSync(localAnnotation.id);
    return localAnnotation;
  }
};

export const updateAnnotationOfflineFirst = async (
  command: UpdateAnnotationCommand,
  remoteRepository: AnnotationRemoteRepository,
): Promise<ReaderAnnotation> => {
  const localAnnotation = await updateLocalAnnotation(command);
  if (!localAnnotation) {
    if (isDeviceOnline()) {
      return remoteRepository.update(command);
    }
    throw new Error('Anotacao nao encontrada no armazenamento local.');
  }

  const localRecord = await getLocalAnnotationRecord(localAnnotation.id);
  if (!localRecord) {
    return localAnnotation;
  }

  const isPendingCreate = localRecord.localId < 0 && localRecord.remoteId == null;
  if (isPendingCreate) {
    return localAnnotation;
  }

  if (!isDeviceOnline()) {
    await enqueueAnnotationUpdateSync(localRecord.localId);
    return localAnnotation;
  }

  const remoteId = localRecord.remoteId ?? localRecord.localId;
  try {
    const remoteAnnotation = await remoteRepository.update({
      id: remoteId,
      color: localRecord.color,
      note: localRecord.note ?? undefined,
    });
    await replaceLocalAnnotationWithSynced(localRecord.localId, remoteAnnotation);
    await clearAnnotationSyncOperations(localRecord.localId);
    return remoteAnnotation;
  } catch {
    await enqueueAnnotationUpdateSync(localRecord.localId);
    return localAnnotation;
  }
};

export const deleteAnnotationOfflineFirst = async (
  localId: number,
  remoteRepository: AnnotationRemoteRepository,
): Promise<void> => {
  const localRecord = await getLocalAnnotationRecord(localId);

  if (localRecord && localRecord.localId < 0 && localRecord.remoteId == null) {
    await removeLocalAnnotation(localRecord.localId);
    await clearAnnotationSyncOperations(localRecord.localId);
    return;
  }

  if (!localRecord) {
    if (!isDeviceOnline()) {
      await enqueueAnnotationDeleteSync(localId, localId > 0 ? localId : null);
      return;
    }

    try {
      await remoteRepository.delete(localId);
      await clearAnnotationSyncOperations(localId);
    } catch (error: unknown) {
      if (isAnnotationHttpStatusError(error) && error.status === 404) {
        await clearAnnotationSyncOperations(localId);
        return;
      }
      await enqueueAnnotationDeleteSync(localId, localId > 0 ? localId : null);
    }
    return;
  }

  const remoteId = localRecord.remoteId ?? (localRecord.localId > 0 ? localRecord.localId : null);

  if (!isDeviceOnline()) {
    await markLocalAnnotationPendingDelete(localRecord.localId);
    await enqueueAnnotationDeleteSync(localRecord.localId, remoteId);
    return;
  }

  try {
    if (remoteId != null) {
      await remoteRepository.delete(remoteId);
    }
    await removeLocalAnnotation(localRecord.localId);
    await clearAnnotationSyncOperations(localRecord.localId);
  } catch (error: unknown) {
    if (isAnnotationHttpStatusError(error) && error.status === 404) {
      await removeLocalAnnotation(localRecord.localId);
      await clearAnnotationSyncOperations(localRecord.localId);
      return;
    }
    await markLocalAnnotationPendingDelete(localRecord.localId);
    await enqueueAnnotationDeleteSync(localRecord.localId, remoteId);
  }
};
