import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book } from '@/types';
import { createOfflineBookCoverBackfillService } from './offline-book-cover-backfill-service';

const createBook = (id: number, coverUrl: string | null = `https://cdn.readium.local/covers/${id}.jpg`): Book => ({
  id,
  title: `Livro ${id}`,
  author: null,
  pages: null,
  format: 'PDF',
  status: 'TO_READ',
  coverUrl,
  lastReadPage: null,
});

const createDeferred = <T = void>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('offline-book-cover-backfill-service', () => {
  const snapshotCoverByBookId = new Map<number, string | null>();
  const listSnapshotsByIds = vi.fn(async (bookIds: number[]) => {
    const map = new Map<number, {
      bookId: number;
      title: null;
      author: null;
      pages: null;
      format: null;
      status: null;
      coverUrl: string | null;
      lastReadPage: null;
      updatedAt: string;
    }>();

    bookIds.forEach((bookId) => {
      map.set(bookId, {
        bookId,
        title: null,
        author: null,
        pages: null,
        format: null,
        status: null,
        coverUrl: snapshotCoverByBookId.get(bookId) ?? null,
        lastReadPage: null,
        updatedAt: '2026-02-25T00:00:00.000Z',
      });
    });

    return map;
  });
  const getRemoteBook = vi.fn<(_bookId: number) => Promise<Book>>();
  const upsertSnapshot = vi.fn(async (book: Partial<Book> & { id: number }) => {
    snapshotCoverByBookId.set(book.id, book.coverUrl ?? null);
  });
  const resolveCoverUrl = vi.fn(async (coverUrl: string | null) => coverUrl);

  beforeEach(() => {
    vi.clearAllMocks();
    snapshotCoverByBookId.clear();
  });

  it('processa ids adicionados durante um backfill em andamento', async () => {
    const gate = createDeferred<void>();
    getRemoteBook.mockImplementation(async (bookId: number) => {
      if (bookId === 1) {
        await gate.promise;
      }
      return createBook(bookId);
    });

    const backfill = createOfflineBookCoverBackfillService({
      listSnapshotsByIds,
      getRemoteBook,
      upsertSnapshot,
      resolveCoverUrl,
    });

    const firstRun = backfill([1]);
    await Promise.resolve();
    const secondRun = backfill([2]);

    gate.resolve();
    const [firstUpdatedCount, secondUpdatedCount] = await Promise.all([firstRun, secondRun]);

    expect(firstUpdatedCount).toBe(2);
    expect(secondUpdatedCount).toBe(2);
    expect(getRemoteBook).toHaveBeenCalledWith(1);
    expect(getRemoteBook).toHaveBeenCalledWith(2);
    expect(upsertSnapshot).toHaveBeenCalledWith({ id: 1, coverUrl: createBook(1).coverUrl });
    expect(upsertSnapshot).toHaveBeenCalledWith({ id: 2, coverUrl: createBook(2).coverUrl });
  });

  it('permite nova tentativa sem force apos falha transitoria', async () => {
    getRemoteBook
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(createBook(3));

    const backfill = createOfflineBookCoverBackfillService({
      listSnapshotsByIds,
      getRemoteBook,
      upsertSnapshot,
      resolveCoverUrl,
    });

    const firstAttempt = await backfill([3]);
    const secondAttempt = await backfill([3]);

    expect(firstAttempt).toBe(0);
    expect(secondAttempt).toBe(1);
    expect(getRemoteBook).toHaveBeenCalledTimes(2);
    expect(upsertSnapshot).toHaveBeenCalledTimes(1);
    expect(upsertSnapshot).toHaveBeenCalledWith({ id: 3, coverUrl: createBook(3).coverUrl });
  });
});
