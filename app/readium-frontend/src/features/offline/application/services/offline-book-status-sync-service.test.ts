import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookStatus } from '@/types';

const {
  mockUpdateBookStatus,
  mockEnqueueSyncOperation,
  mockClearSyncOperationByType,
  mockIsDeviceOnline,
  mockUpsertOfflineBookSnapshot,
} = vi.hoisted(() => ({
  mockUpdateBookStatus: vi.fn(),
  mockEnqueueSyncOperation: vi.fn(),
  mockClearSyncOperationByType: vi.fn(),
  mockIsDeviceOnline: vi.fn(),
  mockUpsertOfflineBookSnapshot: vi.fn(),
}));

vi.mock('@/services/bookApi', () => ({
  bookApi: {
    updateBookStatus: mockUpdateBookStatus,
  },
}));

vi.mock('./offline-sync-queue-service', () => ({
  enqueueSyncOperation: mockEnqueueSyncOperation,
  clearSyncOperationByType: mockClearSyncOperationByType,
}));

vi.mock('./offline-network-service', () => ({
  isDeviceOnline: mockIsDeviceOnline,
}));

vi.mock('./offline-book-snapshot-service', () => ({
  upsertOfflineBookSnapshot: mockUpsertOfflineBookSnapshot,
}));

import { updateBookStatusOfflineFirst } from './offline-book-status-sync-service';

const command = {
  bookId: 7,
  status: 'READING' as BookStatus,
};

describe('offline-book-status-sync-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnqueueSyncOperation.mockResolvedValue(undefined);
    mockClearSyncOperationByType.mockResolvedValue(undefined);
    mockUpsertOfflineBookSnapshot.mockResolvedValue(undefined);
    mockUpdateBookStatus.mockResolvedValue(undefined);
  });

  it('enfileira sincronizacao quando offline', async () => {
    mockIsDeviceOnline.mockReturnValue(false);

    await updateBookStatusOfflineFirst(command);

    expect(mockUpsertOfflineBookSnapshot).toHaveBeenCalledWith({
      id: command.bookId,
      status: command.status,
    });
    expect(mockEnqueueSyncOperation).toHaveBeenCalledWith({
      entityType: 'BOOK',
      entityId: String(command.bookId),
      operationType: 'UPSERT_BOOK_STATUS',
      payload: command,
    });
    expect(mockUpdateBookStatus).not.toHaveBeenCalled();
    expect(mockClearSyncOperationByType).not.toHaveBeenCalled();
  });

  it('sincroniza e limpa fila quando online', async () => {
    mockIsDeviceOnline.mockReturnValue(true);

    await updateBookStatusOfflineFirst(command);

    expect(mockUpdateBookStatus).toHaveBeenCalledWith(command.bookId, command.status);
    expect(mockClearSyncOperationByType).toHaveBeenCalledWith(
      'BOOK',
      String(command.bookId),
      'UPSERT_BOOK_STATUS',
    );
    expect(mockEnqueueSyncOperation).not.toHaveBeenCalled();
  });

  it('enfileira fallback quando API falha online', async () => {
    mockIsDeviceOnline.mockReturnValue(true);
    mockUpdateBookStatus.mockRejectedValue(new Error('network'));

    await updateBookStatusOfflineFirst(command);

    expect(mockEnqueueSyncOperation).toHaveBeenCalledWith({
      entityType: 'BOOK',
      entityId: String(command.bookId),
      operationType: 'UPSERT_BOOK_STATUS',
      payload: command,
    });
  });
});
