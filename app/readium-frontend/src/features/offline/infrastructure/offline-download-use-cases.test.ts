import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book } from '@/types';
import type { OfflineBookDownload } from '../domain/offline-book';

const {
  mockListOfflineBookDownloads,
  mockGetOfflineBookDownload,
  mockSaveOfflineBookDownload,
  mockRemoveOfflineBookDownload,
  mockListOfflineBookSnapshotsByIds,
  mockUpsertOfflineBookSnapshot,
  mockGetBook,
  mockResolveOfflineCoverUrl,
  mockCreateOfflineBookCoverBackfillService,
  mockBackfillOfflineBookCovers,
  mockPrefetchOfflineBookAnnotations,
} = vi.hoisted(() => ({
  mockListOfflineBookDownloads: vi.fn(),
  mockGetOfflineBookDownload: vi.fn(),
  mockSaveOfflineBookDownload: vi.fn(),
  mockRemoveOfflineBookDownload: vi.fn(),
  mockListOfflineBookSnapshotsByIds: vi.fn(),
  mockUpsertOfflineBookSnapshot: vi.fn(),
  mockGetBook: vi.fn(),
  mockResolveOfflineCoverUrl: vi.fn(),
  mockBackfillOfflineBookCovers: vi.fn(),
  mockCreateOfflineBookCoverBackfillService: vi.fn((_) => mockBackfillOfflineBookCovers),
  mockPrefetchOfflineBookAnnotations: vi.fn(),
}));

vi.mock('../application/services/offline-book-download-service', () => ({
  listOfflineBookDownloads: mockListOfflineBookDownloads,
  getOfflineBookDownload: mockGetOfflineBookDownload,
  saveOfflineBookDownload: mockSaveOfflineBookDownload,
  removeOfflineBookDownload: mockRemoveOfflineBookDownload,
}));

vi.mock('../application/services/offline-book-snapshot-service', () => ({
  listOfflineBookSnapshotsByIds: mockListOfflineBookSnapshotsByIds,
  upsertOfflineBookSnapshot: mockUpsertOfflineBookSnapshot,
}));

vi.mock('@/services/bookApi', () => ({
  getBook: mockGetBook,
}));

vi.mock('../application/services/offline-cover-resolver-service', () => ({
  resolveOfflineCoverUrl: mockResolveOfflineCoverUrl,
}));

vi.mock('../application/services/offline-book-cover-backfill-service', () => ({
  createOfflineBookCoverBackfillService: mockCreateOfflineBookCoverBackfillService,
}));

vi.mock('../application/services/offline-annotation-prefetch-service', () => ({
  prefetchOfflineBookAnnotations: mockPrefetchOfflineBookAnnotations,
}));

import { defaultOfflineDownloadUseCases } from './offline-download-use-cases';

const sampleBook: Book = {
  id: 7,
  title: 'Clean Architecture',
  author: 'Robert C. Martin',
  pages: 432,
  format: 'PDF',
  status: 'TO_READ',
  coverUrl: null,
  lastReadPage: null,
};

const sampleDownload: OfflineBookDownload = {
  bookId: 7,
  title: 'Clean Architecture',
  author: 'Robert C. Martin',
  pages: 432,
  storageType: 'indexeddb',
  filePath: '',
  fileUri: '',
  webViewUrl: '',
  fileBlob: null,
  sizeBytes: 1024,
  downloadedAt: '2026-02-26T00:00:00.000Z',
  updatedAt: '2026-02-26T00:00:00.000Z',
};

describe('offline-download-use-cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveOfflineBookDownload.mockResolvedValue(sampleDownload);
    mockPrefetchOfflineBookAnnotations.mockResolvedValue(undefined);
  });

  it('sincroniza anotacoes apos salvar o download', async () => {
    const onProgressPercent = vi.fn();
    mockSaveOfflineBookDownload.mockImplementation(async (_book, options) => {
      options?.onProgress?.({
        bytes: 512,
        contentLength: 1024,
        lengthComputable: true,
        progressPercent: 50,
      });
      return sampleDownload;
    });

    const result = await defaultOfflineDownloadUseCases.saveDownload(sampleBook, {
      onProgressPercent,
    });

    expect(result).toEqual(sampleDownload);
    expect(mockSaveOfflineBookDownload).toHaveBeenCalledWith(sampleBook, expect.objectContaining({
      onProgress: expect.any(Function),
    }));
    expect(onProgressPercent).toHaveBeenCalledWith(50);
    expect(mockPrefetchOfflineBookAnnotations).toHaveBeenCalledWith(sampleBook.id);
  });

  it('nao bloqueia download se prefetch de anotacoes falhar', async () => {
    mockPrefetchOfflineBookAnnotations.mockRejectedValue(new Error('network error'));

    await expect(defaultOfflineDownloadUseCases.saveDownload(sampleBook)).resolves.toEqual(sampleDownload);
    expect(mockPrefetchOfflineBookAnnotations).toHaveBeenCalledWith(sampleBook.id);
  });
});
