import type { Book } from '@/types';
import { offlineBooksDb } from '../../infrastructure/storage/offline-books-db';
import type { OfflineBookSnapshot } from '../../domain/offline-sync';
import { nowIso } from './offline-time';

const isDataUrl = (value: string | null | undefined): boolean =>
  typeof value === 'string' && value.startsWith('data:');

const mergeCoverUrl = (
  previous: Partial<Book> | undefined,
  current: Partial<Book>,
): string | null => {
  const previousCoverUrl = previous?.coverUrl ?? null;
  const currentCoverUrl = current.coverUrl ?? null;

  if (isDataUrl(previousCoverUrl) && !isDataUrl(currentCoverUrl)) {
    return previousCoverUrl;
  }

  return currentCoverUrl ?? previousCoverUrl;
};

const mergeSnapshot = (
  previous: Partial<Book> | undefined,
  current: Partial<Book>,
) => ({
  title: current.title ?? previous?.title ?? null,
  author: current.author ?? previous?.author ?? null,
  pages: current.pages ?? previous?.pages ?? null,
  format: current.format ?? previous?.format ?? null,
  status: current.status ?? previous?.status ?? null,
  coverUrl: mergeCoverUrl(previous, current),
  lastReadPage: current.lastReadPage ?? previous?.lastReadPage ?? null,
  updatedAt: nowIso(),
});

export const upsertOfflineBookSnapshot = async (book: Partial<Book> & { id: number }): Promise<void> => {
  const existing = await offlineBooksDb.booksOffline.get(book.id);
  const merged = mergeSnapshot(existing, book);

  await offlineBooksDb.booksOffline.put({
    bookId: book.id,
    ...merged,
  });
};

type ProgressSyncMode = 'MAX' | 'EXACT';

const resolveNextLastReadPage = (
  previousLastReadPage: number,
  safePage: number,
  mode: ProgressSyncMode,
): number => {
  if (mode === 'EXACT') {
    return safePage;
  }
  return Math.max(previousLastReadPage, safePage);
};

export const updateOfflineBookLastReadPage = async (
  bookId: number,
  page: number,
  mode: ProgressSyncMode = 'MAX',
): Promise<void> => {
  const safePage = Math.max(0, Math.floor(page));
  const existing = await offlineBooksDb.booksOffline.get(bookId);
  const previousLastReadPage = existing?.lastReadPage ?? 0;

  await offlineBooksDb.booksOffline.put({
    bookId,
    title: existing?.title ?? null,
    author: existing?.author ?? null,
    pages: existing?.pages ?? null,
    format: existing?.format ?? null,
    status: existing?.status ?? null,
    coverUrl: existing?.coverUrl ?? null,
    lastReadPage: resolveNextLastReadPage(previousLastReadPage, safePage, mode),
    updatedAt: nowIso(),
  });
};

export const upsertOfflineBookSnapshots = async (books: Book[]): Promise<void> => {
  if (books.length === 0) {
    return;
  }

  await offlineBooksDb.transaction(
    'rw',
    offlineBooksDb.booksOffline,
    async () => {
      for (const book of books) {
        await upsertOfflineBookSnapshot(book);
      }
    },
  );
};

export const getOfflineBookSnapshot = async (bookId: number): Promise<OfflineBookSnapshot | null> => {
  const record = await offlineBooksDb.booksOffline.get(bookId);
  return record ?? null;
};

export const listOfflineBookSnapshotsByIds = async (
  bookIds: number[],
): Promise<Map<number, OfflineBookSnapshot>> => {
  if (bookIds.length === 0) {
    return new Map();
  }

  const snapshots = await offlineBooksDb.booksOffline.bulkGet(bookIds);
  const map = new Map<number, OfflineBookSnapshot>();
  snapshots.forEach((snapshot, index) => {
    if (!snapshot) {
      return;
    }
    const bookId = bookIds[index];
    map.set(bookId, snapshot);
  });
  return map;
};
