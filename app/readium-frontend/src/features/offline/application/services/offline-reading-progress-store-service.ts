import { offlineBooksDb } from '../../infrastructure/storage/offline-books-db';
import { nowIso } from './offline-time';

export const saveLocalReadingProgress = async (bookId: number, page: number): Promise<number> => {
  const safePage = Math.max(1, Math.floor(page));
  const existing = await offlineBooksDb.readingProgressLocal.get(bookId);
  const nextPage = Math.max(existing?.page ?? 0, safePage);

  await offlineBooksDb.readingProgressLocal.put({
    bookId,
    page: nextPage,
    updatedAt: nowIso(),
    syncedAt: existing?.syncedAt ?? null,
    syncStatus: 'PENDING',
  });

  return nextPage;
};

export const markLocalReadingProgressSynced = async (bookId: number, page: number): Promise<void> => {
  const safePage = Math.max(1, Math.floor(page));
  const existing = await offlineBooksDb.readingProgressLocal.get(bookId);
  const nextPage = Math.max(existing?.page ?? 0, safePage);
  const now = nowIso();

  await offlineBooksDb.readingProgressLocal.put({
    bookId,
    page: nextPage,
    updatedAt: now,
    syncedAt: now,
    syncStatus: 'SYNCED',
  });
};
