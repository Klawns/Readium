import type { ReaderAnnotation } from '@/features/reader/domain/models';
import type {
  CreateAnnotationCommand,
  UpdateAnnotationCommand,
} from '@/features/reader/domain/ports/AnnotationRepository';
import {
  clearSyncOperationsByEntity,
  enqueueSyncOperation,
} from './offline-sync-queue-service';
import { isDeviceOnline } from './offline-network-service';
import { syncLocalAnnotationsFromRemote } from './offline-annotation-store-service';

export interface AnnotationRemoteRepository {
  getByBook(bookId: number): Promise<ReaderAnnotation[]>;
  create(command: CreateAnnotationCommand): Promise<ReaderAnnotation>;
  update(command: UpdateAnnotationCommand): Promise<ReaderAnnotation>;
  delete(id: number): Promise<void>;
}

const annotationEntityType = 'ANNOTATION' as const;
const createAnnotationOperation = 'CREATE_ANNOTATION' as const;
const updateAnnotationOperation = 'UPDATE_ANNOTATION' as const;
const deleteAnnotationOperation = 'DELETE_ANNOTATION' as const;

const toAnnotationEntityId = (localId: number): string => String(localId);

const bookSyncInFlight = new Map<number, Promise<void>>();

export const clearAnnotationSyncOperations = async (localId: number): Promise<void> => {
  await clearSyncOperationsByEntity(annotationEntityType, toAnnotationEntityId(localId));
};

export const enqueueAnnotationCreateSync = async (localId: number): Promise<void> => {
  await enqueueSyncOperation({
    entityType: annotationEntityType,
    entityId: toAnnotationEntityId(localId),
    operationType: createAnnotationOperation,
    payload: { localId },
  });
};

export const enqueueAnnotationUpdateSync = async (localId: number): Promise<void> => {
  await enqueueSyncOperation({
    entityType: annotationEntityType,
    entityId: toAnnotationEntityId(localId),
    operationType: updateAnnotationOperation,
    payload: { localId },
  });
};

export const enqueueAnnotationDeleteSync = async (
  localId: number,
  remoteId: number | null,
): Promise<void> => {
  await enqueueSyncOperation({
    entityType: annotationEntityType,
    entityId: toAnnotationEntityId(localId),
    operationType: deleteAnnotationOperation,
    payload: { localId, remoteId },
  });
};

const runBookRemoteSync = async (
  bookId: number,
  remoteRepository: AnnotationRemoteRepository,
): Promise<void> => {
  const remoteAnnotations = await remoteRepository.getByBook(bookId);
  await syncLocalAnnotationsFromRemote(bookId, remoteAnnotations);
};

export const syncBookAnnotationsIfPossible = async (
  bookId: number,
  remoteRepository: AnnotationRemoteRepository,
): Promise<void> => {
  if (!isDeviceOnline()) {
    return;
  }

  const existingSync = bookSyncInFlight.get(bookId);
  if (existingSync) {
    await existingSync;
    return;
  }

  const syncPromise = runBookRemoteSync(bookId, remoteRepository)
    .catch(() => {
      // Modo offline-first: erros remotos nao bloqueiam leitura local.
    })
    .finally(() => {
      bookSyncInFlight.delete(bookId);
    });

  bookSyncInFlight.set(bookId, syncPromise);
  await syncPromise;
};
