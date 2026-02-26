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
const defaultProgressMode = 'MAX' as const;

const toProgressEntityId = (bookId: number): string => String(bookId);

const enqueueProgressSync = async (
  bookId: number,
  page: number,
  mode: 'MAX' | 'EXACT',
): Promise<void> => {
  await enqueueSyncOperation({
    entityType: progressEntityType,
    entityId: toProgressEntityId(bookId),
    operationType: progressOperationType,
    payload: { bookId, page, mode },
  });
};

export interface SaveProgressOfflineFirstCommand {
  bookId: number;
  page: number;
  keepalive?: boolean;
  mode?: 'MAX' | 'EXACT';
}

export const saveProgressOfflineFirst = async ({
  bookId,
  page,
  keepalive = false,
  mode = defaultProgressMode,
}: SaveProgressOfflineFirstCommand): Promise<void> => {
  const localPage = await saveLocalReadingProgress(bookId, page, mode);
  await updateOfflineBookLastReadPage(bookId, localPage, mode);

  if (!isDeviceOnline()) {
    await enqueueProgressSync(bookId, localPage, mode);
    return;
  }

  try {
    await bookApi.updateProgress(bookId, localPage, { keepalive, mode });
    await markLocalReadingProgressSynced(bookId, localPage, mode);
    await clearSyncOperationByType(progressEntityType, toProgressEntityId(bookId), progressOperationType);
  } catch {
    await enqueueProgressSync(bookId, localPage, mode);
  }
};
