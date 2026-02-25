import { createOfflineDownloadUseCases } from '../application/use-cases/offline-download-use-cases';
import {
  getOfflineBookDownload,
  listOfflineBookDownloads,
  removeOfflineBookDownload,
  saveOfflineBookDownload,
} from '../application/services/offline-book-download-service';
import {
  listOfflineBookSnapshotsByIds,
  upsertOfflineBookSnapshot,
} from '../application/services/offline-book-snapshot-service';
import { getBook } from '@/services/bookApi';
import { resolveOfflineCoverUrl } from '../application/services/offline-cover-resolver-service';
import { createOfflineBookCoverBackfillService } from '../application/services/offline-book-cover-backfill-service';

const backfillOfflineBookCovers = createOfflineBookCoverBackfillService({
  listSnapshotsByIds: listOfflineBookSnapshotsByIds,
  getRemoteBook: getBook,
  upsertSnapshot: upsertOfflineBookSnapshot,
  resolveCoverUrl: resolveOfflineCoverUrl,
});

export const defaultOfflineDownloadUseCases = createOfflineDownloadUseCases({
  listDownloads: listOfflineBookDownloads,
  getDownload: getOfflineBookDownload,
  saveDownload: async (book, options) => saveOfflineBookDownload(book, {
    onProgress: (progress) => options?.onProgressPercent?.(progress.progressPercent),
  }),
  removeDownload: removeOfflineBookDownload,
  listSnapshotsByIds: listOfflineBookSnapshotsByIds,
  backfillCoverSnapshots: backfillOfflineBookCovers,
});
