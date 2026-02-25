import type { BookStatus } from '@/types';
import { bookApi } from '@/services/bookApi';
import {
  clearSyncOperationByType,
  enqueueSyncOperation,
} from './offline-sync-queue-service';
import { isDeviceOnline } from './offline-network-service';
import { upsertOfflineBookSnapshot } from './offline-book-snapshot-service';

const bookEntityType = 'BOOK' as const;
const statusOperationType = 'UPSERT_BOOK_STATUS' as const;

const toBookEntityId = (bookId: number): string => String(bookId);

const enqueueBookStatusSync = async (bookId: number, status: BookStatus): Promise<void> => {
  await enqueueSyncOperation({
    entityType: bookEntityType,
    entityId: toBookEntityId(bookId),
    operationType: statusOperationType,
    payload: { bookId, status },
  });
};

const clearBookStatusSyncOperation = async (bookId: number): Promise<void> => {
  await clearSyncOperationByType(bookEntityType, toBookEntityId(bookId), statusOperationType);
};

export interface UpdateBookStatusOfflineFirstCommand {
  bookId: number;
  status: BookStatus;
}

export const updateBookStatusOfflineFirst = async ({
  bookId,
  status,
}: UpdateBookStatusOfflineFirstCommand): Promise<void> => {
  await upsertOfflineBookSnapshot({
    id: bookId,
    status,
  });

  if (!isDeviceOnline()) {
    await enqueueBookStatusSync(bookId, status);
    return;
  }

  try {
    await bookApi.updateBookStatus(bookId, status);
    await clearBookStatusSyncOperation(bookId);
  } catch {
    await enqueueBookStatusSync(bookId, status);
  }
};
