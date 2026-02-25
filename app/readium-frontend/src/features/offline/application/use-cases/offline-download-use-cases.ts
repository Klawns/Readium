import type { Book } from '@/types';
import type { OfflineBookDownload } from '../../domain/offline-book';
import type { OfflineBookSnapshot } from '../../domain/offline-sync';
import type { BackfillOfflineBookCoverOptions } from '../services/offline-book-cover-backfill-service';

export interface SaveOfflineDownloadOptions {
  onProgressPercent?: (progressPercent: number | null) => void;
}

export type BackfillOfflineCoverSnapshotsOptions = BackfillOfflineBookCoverOptions;

export interface OfflineDownloadUseCases {
  listDownloads(): Promise<OfflineBookDownload[]>;
  getDownload(bookId: number): Promise<OfflineBookDownload | null>;
  saveDownload(book: Book, options?: SaveOfflineDownloadOptions): Promise<OfflineBookDownload>;
  removeDownload(bookId: number): Promise<void>;
  listSnapshotsByIds(bookIds: number[]): Promise<Map<number, OfflineBookSnapshot>>;
  backfillCoverSnapshots(
    bookIds: number[],
    options?: BackfillOfflineCoverSnapshotsOptions,
  ): Promise<number>;
}

interface OfflineDownloadUseCaseDependencies {
  listDownloads: () => Promise<OfflineBookDownload[]>;
  getDownload: (bookId: number) => Promise<OfflineBookDownload | null>;
  saveDownload: (
    book: Book,
    options?: SaveOfflineDownloadOptions,
  ) => Promise<OfflineBookDownload>;
  removeDownload: (bookId: number) => Promise<void>;
  listSnapshotsByIds: (bookIds: number[]) => Promise<Map<number, OfflineBookSnapshot>>;
  backfillCoverSnapshots: (
    bookIds: number[],
    options?: BackfillOfflineCoverSnapshotsOptions,
  ) => Promise<number>;
}

export const createOfflineDownloadUseCases = (
  dependencies: OfflineDownloadUseCaseDependencies,
): OfflineDownloadUseCases => ({
  listDownloads: () => dependencies.listDownloads(),
  getDownload: (bookId) => dependencies.getDownload(bookId),
  saveDownload: (book, options) => dependencies.saveDownload(book, options),
  removeDownload: (bookId) => dependencies.removeDownload(bookId),
  listSnapshotsByIds: (bookIds) => dependencies.listSnapshotsByIds(bookIds),
  backfillCoverSnapshots: (bookIds, options) => dependencies.backfillCoverSnapshots(bookIds, options),
});
