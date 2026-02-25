import { bookApi } from '@/services/bookApi';
import {
  clearSyncOperationByType,
  enqueueSyncOperation,
} from './offline-sync-queue-service';
import { isDeviceOnline } from './offline-network-service';
import {
  markLocalReadingProgressSynced,
  saveLocalReadingProgress,
} from './offline-reading-progress-store-service';
import { updateOfflineBookLastReadPage } from './offline-book-snapshot-service';

const progressEntityType = 'READING_PROGRESS' as const;
const progressOperationType = 'UPSERT_PROGRESS' as const;

const toProgressEntityId = (bookId: number): string => String(bookId);

const enqueueProgressSync = async (bookId: number, page: number): Promise<void> => {
  await enqueueSyncOperation({
    entityType: progressEntityType,
    entityId: toProgressEntityId(bookId),
    operationType: progressOperationType,
    payload: { bookId, page },
  });
};

export interface SaveProgressOfflineFirstCommand {
  bookId: number;
  page: number;
  keepalive?: boolean;
}

export const saveProgressOfflineFirst = async ({
  bookId,
  page,
  keepalive = false,
}: SaveProgressOfflineFirstCommand): Promise<void> => {
  const localPage = await saveLocalReadingProgress(bookId, page);
  await updateOfflineBookLastReadPage(bookId, localPage);

  if (!isDeviceOnline()) {
    await enqueueProgressSync(bookId, localPage);
    return;
  }

  try {
    await bookApi.updateProgress(bookId, localPage, keepalive);
    await markLocalReadingProgressSynced(bookId, localPage);
    await clearSyncOperationByType(progressEntityType, toProgressEntityId(bookId), progressOperationType);
  } catch {
    await enqueueProgressSync(bookId, localPage);
  }
};
