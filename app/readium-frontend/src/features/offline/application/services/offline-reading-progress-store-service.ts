import { offlineBooksDb } from '../../infrastructure/storage/offline-books-db';
import { nowIso } from './offline-time';

type ProgressSyncMode = 'MAX' | 'EXACT';

const resolveNextPage = (existingPage: number, safePage: number, mode: ProgressSyncMode): number => {
  if (mode === 'EXACT') {
    return safePage;
  }
  return Math.max(existingPage, safePage);
};

export const saveLocalReadingProgress = async (
  bookId: number,
  page: number,
  mode: ProgressSyncMode = 'MAX',
): Promise<number> => {
  const safePage = Math.max(0, Math.floor(page));
  const existing = await offlineBooksDb.readingProgressLocal.get(bookId);
  const nextPage = resolveNextPage(existing?.page ?? 0, safePage, mode);

  await offlineBooksDb.readingProgressLocal.put({
    bookId,
    page: nextPage,
    updatedAt: nowIso(),
    syncedAt: existing?.syncedAt ?? null,
    syncStatus: 'PENDING',
  });

  return nextPage;
};

export const markLocalReadingProgressSynced = async (
  bookId: number,
  page: number,
  mode: ProgressSyncMode = 'MAX',
): Promise<void> => {
  const safePage = Math.max(0, Math.floor(page));
  const existing = await offlineBooksDb.readingProgressLocal.get(bookId);
  const nextPage = resolveNextPage(existing?.page ?? 0, safePage, mode);
  const now = nowIso();

  await offlineBooksDb.readingProgressLocal.put({
    bookId,
    page: nextPage,
    updatedAt: now,
    syncedAt: now,
    syncStatus: 'SYNCED',
  });
};
