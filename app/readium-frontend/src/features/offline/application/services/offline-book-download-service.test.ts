import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book } from '@/types';

const {
  downloadsStore,
  downloadBlobsStore,
  mockUpsertOfflineBookSnapshot,
  mockFetchArrayBuffer,
  mockIsNativeOfflineSupported,
  mockDownloadOfflinePdfToNativeStorage,
  mockStoreOfflinePdfInIndexedDb,
  mockRemoveOfflinePdf,
  mockToApiUrl,
} = vi.hoisted(() => ({
  downloadsStore: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    toArray: vi.fn(),
  },
  downloadBlobsStore: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  mockUpsertOfflineBookSnapshot: vi.fn(),
  mockFetchArrayBuffer: vi.fn(),
  mockIsNativeOfflineSupported: vi.fn(),
  mockDownloadOfflinePdfToNativeStorage: vi.fn(),
  mockStoreOfflinePdfInIndexedDb: vi.fn(),
  mockRemoveOfflinePdf: vi.fn(),
  mockToApiUrl: vi.fn((path: string) => `https://api.readium.local${path}`),
}));

vi.mock('../../infrastructure/storage/offline-books-db', () => ({
  offlineBooksDb: {
    downloads: downloadsStore,
    downloadBlobs: downloadBlobsStore,
  },
}));

vi.mock('./offline-book-snapshot-service', () => ({
  upsertOfflineBookSnapshot: mockUpsertOfflineBookSnapshot,
}));

vi.mock('@/features/offline/infrastructure/storage/offline-file-binary', () => ({
  fetchArrayBuffer: mockFetchArrayBuffer,
}));

vi.mock('../../infrastructure/storage/offline-pdf-storage', () => ({
  isNativeOfflineSupported: mockIsNativeOfflineSupported,
  downloadOfflinePdfToNativeStorage: mockDownloadOfflinePdfToNativeStorage,
  storeOfflinePdfInIndexedDb: mockStoreOfflinePdfInIndexedDb,
  removeOfflinePdf: mockRemoveOfflinePdf,
}));

vi.mock('@/services/http/api-base-url', () => ({
  toApiUrl: mockToApiUrl,
}));

import {
  getOfflineBookDownload,
  listOfflineBookDownloads,
  removeOfflineBookDownload,
  saveOfflineBookDownload,
} from './offline-book-download-service';

const sampleBook: Book = {
  id: 42,
  title: 'Domain-Driven Design',
  author: 'Eric Evans',
  pages: 560,
  format: 'PDF',
  status: 'TO_READ',
  coverUrl: null,
  lastReadPage: null,
};

describe('offline-book-download-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    downloadsStore.get.mockResolvedValue(undefined);
    downloadsStore.put.mockResolvedValue(undefined);
    downloadsStore.delete.mockResolvedValue(undefined);
    downloadsStore.toArray.mockResolvedValue([]);
    downloadBlobsStore.get.mockResolvedValue(undefined);
    downloadBlobsStore.put.mockResolvedValue(undefined);
    downloadBlobsStore.delete.mockResolvedValue(undefined);
    mockIsNativeOfflineSupported.mockReturnValue(false);
  });

  it('salva download offline em IndexedDB no web', async () => {
    const fileBuffer = new ArrayBuffer(16);
    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });

    mockFetchArrayBuffer.mockResolvedValue(fileBuffer);
    mockStoreOfflinePdfInIndexedDb.mockResolvedValue({
      storageType: 'indexeddb',
      filePath: '',
      fileUri: '',
      webViewUrl: '',
      fileBlob,
      sizeBytes: 16,
    });

    const result = await saveOfflineBookDownload(sampleBook);

    expect(mockUpsertOfflineBookSnapshot).toHaveBeenCalledWith(sampleBook);
    expect(mockFetchArrayBuffer).toHaveBeenCalledWith('/books/42/file');
    expect(mockStoreOfflinePdfInIndexedDb).toHaveBeenCalledWith(fileBuffer);
    expect(downloadsStore.put).toHaveBeenCalledWith(expect.objectContaining({
      bookId: 42,
      storageType: 'indexeddb',
      fileBlob: null,
      sizeBytes: 16,
    }));
    expect(downloadBlobsStore.put).toHaveBeenCalledWith(expect.objectContaining({
      bookId: 42,
      blob: fileBlob,
    }));
    expect(result.storageType).toBe('indexeddb');
    expect(result.fileBlob).toBeNull();
  });

  it('usa FileTransfer no nativo com URL absoluta', async () => {
    mockIsNativeOfflineSupported.mockReturnValue(true);
    mockDownloadOfflinePdfToNativeStorage.mockResolvedValue({
      storageType: 'native-filesystem',
      filePath: 'offline-books/book-42.pdf',
      fileUri: 'file:///offline-books/book-42.pdf',
      webViewUrl: 'capacitor://localhost/_capacitor_file_/offline-books/book-42.pdf',
      fileBlob: null,
      sizeBytes: 2048,
    });

    const onProgress = vi.fn();
    const result = await saveOfflineBookDownload(sampleBook, { onProgress });

    expect(mockToApiUrl).toHaveBeenCalledWith('/books/42/file');
    expect(mockDownloadOfflinePdfToNativeStorage).toHaveBeenCalledWith(42, {
      fileUrl: 'https://api.readium.local/books/42/file',
      onProgress,
    });
    expect(mockFetchArrayBuffer).not.toHaveBeenCalled();
    expect(downloadBlobsStore.delete).toHaveBeenCalledWith(42);
    expect(result.storageType).toBe('native-filesystem');
  });

  it('remove arquivo local quando houver filePath', async () => {
    downloadsStore.get.mockResolvedValue({
      bookId: 42,
      filePath: 'offline-books/book-42.pdf',
    });

    await removeOfflineBookDownload(42);

    expect(mockRemoveOfflinePdf).toHaveBeenCalledWith('offline-books/book-42.pdf');
    expect(downloadBlobsStore.delete).toHaveBeenCalledWith(42);
    expect(downloadsStore.delete).toHaveBeenCalledWith(42);
  });

  it('ordena downloads pelo mais recente', async () => {
    downloadsStore.toArray.mockResolvedValue([
      { bookId: 1, downloadedAt: '2024-01-01T00:00:00.000Z' },
      { bookId: 2, downloadedAt: '2025-01-01T00:00:00.000Z' },
    ]);

    const downloads = await listOfflineBookDownloads();

    expect(downloads.map((item: { bookId: number }) => item.bookId)).toEqual([2, 1]);
  });

  it('retorna null quando download nao existe', async () => {
    downloadsStore.get.mockResolvedValue(undefined);
    await expect(getOfflineBookDownload(999)).resolves.toBeNull();
  });

  it('resolve blob do Dexie ao buscar download web', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' });
    downloadsStore.get.mockResolvedValue({
      bookId: 42,
      title: 'DDD',
      author: 'Eric Evans',
      pages: 560,
      storageType: 'indexeddb',
      filePath: '',
      fileUri: '',
      webViewUrl: '',
      fileBlob: null,
      sizeBytes: 3,
      downloadedAt: '2026-02-24T00:00:00.000Z',
      updatedAt: '2026-02-24T00:00:00.000Z',
    });
    downloadBlobsStore.get.mockResolvedValue({
      bookId: 42,
      blob,
      updatedAt: '2026-02-24T00:00:00.000Z',
    });

    const download = await getOfflineBookDownload(42);

    expect(download?.fileBlob).toBe(blob);
  });
});
