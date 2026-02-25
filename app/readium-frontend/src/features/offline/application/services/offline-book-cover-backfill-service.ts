import type { Book } from '@/types';
import type { OfflineBookSnapshot } from '../../domain/offline-sync';

export interface BackfillOfflineBookCoverOptions {
  force?: boolean;
}

interface OfflineBookCoverBackfillDependencies {
  listSnapshotsByIds(bookIds: number[]): Promise<Map<number, OfflineBookSnapshot>>;
  getRemoteBook(bookId: number): Promise<Book>;
  upsertSnapshot(book: Partial<Book> & { id: number }): Promise<void>;
  resolveCoverUrl(coverUrl: string | null): Promise<string | null>;
}

export type BackfillOfflineBookCovers = (
  bookIds: number[],
  options?: BackfillOfflineBookCoverOptions,
) => Promise<number>;

const normalizeBookIds = (bookIds: number[]): number[] => {
  const uniqueBookIds = new Set<number>();
  bookIds.forEach((bookId) => {
    if (!Number.isFinite(bookId) || bookId <= 0) {
      return;
    }
    uniqueBookIds.add(Math.trunc(bookId));
  });
  return [...uniqueBookIds];
};

const shouldBackfillSnapshotCover = (
  snapshot: OfflineBookSnapshot | undefined,
  force: boolean,
): boolean => {
  if (force) {
    return true;
  }

  const coverUrl = snapshot?.coverUrl ?? null;
  return !coverUrl || !coverUrl.startsWith('data:');
};

export const createOfflineBookCoverBackfillService = (
  dependencies: OfflineBookCoverBackfillDependencies,
): BackfillOfflineBookCovers => {
  const queuedBookIds = new Set<number>();
  let activeRun: Promise<number> | null = null;
  let forceRequested = false;

  const runQueue = async (): Promise<number> => {
    let updatedCount = 0;

    while (true) {
      const currentBatch = [...queuedBookIds];
      if (currentBatch.length === 0) {
        break;
      }

      queuedBookIds.clear();
      const shouldForceCurrentBatch = forceRequested;
      forceRequested = false;

      const snapshotsById = await dependencies.listSnapshotsByIds(currentBatch);
      const targetBookIds = currentBatch.filter((bookId) =>
        shouldBackfillSnapshotCover(snapshotsById.get(bookId), shouldForceCurrentBatch),
      );

      for (const bookId of targetBookIds) {
        try {
          const remoteBook = await dependencies.getRemoteBook(bookId);
          const coverUrl = await dependencies.resolveCoverUrl(remoteBook.coverUrl);
          if (!coverUrl) {
            continue;
          }

          await dependencies.upsertSnapshot({
            id: bookId,
            coverUrl,
          });
          updatedCount += 1;
        } catch {
          // Best-effort backfill: ignore transient network or parsing failures.
        }
      }
    }

    return updatedCount;
  };

  return async (bookIds, options) => {
    const normalizedBookIds = normalizeBookIds(bookIds);
    if (normalizedBookIds.length === 0) {
      return 0;
    }

    normalizedBookIds.forEach((bookId) => queuedBookIds.add(bookId));
    forceRequested = forceRequested || Boolean(options?.force);

    if (!activeRun) {
      activeRun = runQueue().finally(() => {
        activeRun = null;
      });
    }

    return activeRun;
  };
};
