import type { Book } from '@/types';
import { toApiUrl } from '@/services/http/api-base-url';
import type { OfflineBookBlobRecord, OfflineBookDownload } from '../../domain/offline-book';
import { offlineBooksDb } from '../../infrastructure/storage/offline-books-db';
import {
  downloadOfflinePdfToNativeStorage,
  isNativeOfflineSupported,
  removeOfflinePdf,
  storeOfflinePdfInIndexedDb,
  type OfflineDownloadProgress,
  type StoredOfflinePdf,
} from '../../infrastructure/storage/offline-pdf-storage';
import { upsertOfflineBookSnapshot } from './offline-book-snapshot-service';
import { fetchArrayBuffer } from '@/features/offline/infrastructure/storage/offline-file-binary';
import { resolveOfflineCoverUrl } from './offline-cover-resolver-service';

const nowIso = (): string => new Date().toISOString();
const buildBookFileEndpoint = (bookId: number): string => `/books/${bookId}/file`;
const buildBookFileAbsoluteUrl = (bookId: number): string => toApiUrl(buildBookFileEndpoint(bookId));

interface SaveOfflineBookDownloadOptions {
  onProgress?: (progress: OfflineDownloadProgress) => void;
}


const createOfflineDownloadRecord = (
  book: Book,
  storedPdf: StoredOfflinePdf,
  downloadedAt: string,
): OfflineBookDownload => ({
  bookId: book.id,
  title: book.title,
  author: book.author ?? null,
  pages: book.pages ?? null,
  storageType: storedPdf.storageType,
  filePath: storedPdf.filePath,
  fileUri: storedPdf.fileUri,
  webViewUrl: storedPdf.webViewUrl,
  fileBlob: null,
  sizeBytes: storedPdf.sizeBytes,
  downloadedAt,
  updatedAt: nowIso(),
});

const sortByLatestDownload = (downloads: OfflineBookDownload[]): OfflineBookDownload[] => (
  downloads
    .slice()
    .sort((left, right) => right.downloadedAt.localeCompare(left.downloadedAt))
);

const persistOfflineBookFile = async (
  bookId: number,
  options?: SaveOfflineBookDownloadOptions,
): Promise<StoredOfflinePdf> => {
  if (isNativeOfflineSupported()) {
    return downloadOfflinePdfToNativeStorage(bookId, {
      fileUrl: buildBookFileAbsoluteUrl(bookId),
      onProgress: options?.onProgress,
    });
  }

  const fileBuffer = await fetchArrayBuffer(buildBookFileEndpoint(bookId));
  return storeOfflinePdfInIndexedDb(fileBuffer);
};

const persistOfflineDownloadMetadata = async (record: OfflineBookDownload): Promise<void> => {
  await offlineBooksDb.downloads.put(record);
};

const createBlobRecord = (bookId: number, blob: Blob): OfflineBookBlobRecord => ({
  bookId,
  blob,
  updatedAt: nowIso(),
});

const persistOfflineDownloadBlob = async (bookId: number, storedPdf: StoredOfflinePdf): Promise<void> => {
  if (storedPdf.storageType === 'indexeddb' && storedPdf.fileBlob) {
    await offlineBooksDb.downloadBlobs.put(createBlobRecord(bookId, storedPdf.fileBlob));
    return;
  }

  await offlineBooksDb.downloadBlobs.delete(bookId);
};

export const saveOfflineBookDownload = async (
  book: Book,
  options?: SaveOfflineBookDownloadOptions,
): Promise<OfflineBookDownload> => {
  const offlineCoverUrl = await resolveOfflineCoverUrl(book.coverUrl);
  await upsertOfflineBookSnapshot({
    ...book,
    coverUrl: offlineCoverUrl,
  });
  const existing = await offlineBooksDb.downloads.get(book.id);
  const downloadedAt = existing?.downloadedAt ?? nowIso();
  const stored = await persistOfflineBookFile(book.id, options);
  const record = createOfflineDownloadRecord(book, stored, downloadedAt);

  await persistOfflineDownloadBlob(book.id, stored);
  await persistOfflineDownloadMetadata(record);
  return record;
};

export const removeOfflineBookDownload = async (bookId: number): Promise<void> => {
  const existing = await offlineBooksDb.downloads.get(bookId);
  if (existing) {
    await removeOfflinePdf(existing.filePath);
  }
  await offlineBooksDb.downloadBlobs.delete(bookId);
  await offlineBooksDb.downloads.delete(bookId);
};

export const listOfflineBookDownloads = async (): Promise<OfflineBookDownload[]> => {
  const downloads = await offlineBooksDb.downloads.toArray();
  return sortByLatestDownload(downloads);
};

export const getOfflineBookDownload = async (bookId: number): Promise<OfflineBookDownload | null> => {
  const record = await offlineBooksDb.downloads.get(bookId);
  if (!record) {
    return null;
  }

  if (record.storageType !== 'indexeddb') {
    return {
      ...record,
      fileBlob: null,
    };
  }

  const blobRecord = await offlineBooksDb.downloadBlobs.get(bookId);
  return {
    ...record,
    fileBlob: blobRecord?.blob ?? null,
  };
};
