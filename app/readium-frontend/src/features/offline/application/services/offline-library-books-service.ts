import type { Book, BookPage, BookStatus, StatusFilter } from '@/types';
import { listOfflineBookDownloads } from './offline-book-download-service';
import { listOfflineBookSnapshotsByIds } from './offline-book-snapshot-service';
import { offlineBooksDb } from '../../infrastructure/storage/offline-books-db';

const toBookStatus = (status: BookStatus | null | undefined): BookStatus => status ?? 'TO_READ';
const DEFAULT_PAGE_SIZE = 12;

const normalizePage = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.trunc(value));
};

const normalizePageSize = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.trunc(value);
};

const normalizeOptionalId = (value: number | null | undefined): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.trunc(value);
};

const matchesQuery = (book: Book, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }
  const title = book.title.toLowerCase();
  const author = (book.author ?? '').toLowerCase();
  return title.includes(normalizedQuery) || author.includes(normalizedQuery);
};

const matchesStatus = (book: Book, status: StatusFilter): boolean =>
  status === 'ALL' || book.status === status;

const createBookPage = (content: Book[], totalElements: number, page: number, size: number): BookPage => {
  const totalPages = totalElements === 0 ? 1 : Math.max(1, Math.ceil(totalElements / size));
  return {
    content,
    totalPages,
    totalElements,
    size,
    number: page,
    first: page <= 0,
    last: page >= totalPages - 1,
    empty: content.length === 0,
  };
};

const buildOfflineBooks = async (): Promise<Book[]> => {
  const downloads = await listOfflineBookDownloads();
  if (downloads.length === 0) {
    return [];
  }

  const bookIds = downloads.map((download) => download.bookId);
  const snapshotsById = await listOfflineBookSnapshotsByIds(bookIds);

  return downloads.map((download) => {
    const snapshot = snapshotsById.get(download.bookId);
    return {
      id: download.bookId,
      title: snapshot?.title ?? download.title,
      author: snapshot?.author ?? download.author ?? null,
      pages: snapshot?.pages ?? download.pages ?? null,
      format: download.storageType === 'indexeddb' || download.storageType === 'native-filesystem'
        ? 'PDF'
        : (snapshot?.format ?? 'PDF'),
      status: toBookStatus(snapshot?.status),
      coverUrl: snapshot?.coverUrl ?? null,
      lastReadPage: snapshot?.lastReadPage ?? null,
    };
  });
};

export const listOfflineLibraryBooks = async (): Promise<Book[]> => {
  return buildOfflineBooks();
};

interface ListOfflineLibraryBooksPageOptions {
  status?: StatusFilter;
  page?: number;
  size?: number;
  query?: string;
  categoryId?: number | null;
  collectionId?: number | null;
}

export const listOfflineLibraryBooksPage = async ({
  status = 'ALL',
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  query = '',
  categoryId = null,
  collectionId = null,
}: ListOfflineLibraryBooksPageOptions = {}): Promise<BookPage> => {
  const [books, categoryLinks, collectionLinks] = await Promise.all([
    buildOfflineBooks(),
    offlineBooksDb.bookCategoriesLocal.toArray(),
    offlineBooksDb.bookCollectionsLocal.toArray(),
  ]);

  const normalizedPage = normalizePage(page);
  const normalizedSize = normalizePageSize(size);
  const normalizedCategoryId = normalizeOptionalId(categoryId);
  const normalizedCollectionId = normalizeOptionalId(collectionId);

  const allowedCategoryBookIds = normalizedCategoryId == null
    ? null
    : new Set(
        categoryLinks
          .filter((link) => link.categoryId === normalizedCategoryId)
          .map((link) => link.bookId),
      );
  const allowedCollectionBookIds = normalizedCollectionId == null
    ? null
    : new Set(
        collectionLinks
          .filter((link) => link.collectionId === normalizedCollectionId)
          .map((link) => link.bookId),
      );

  const filtered = books.filter((book) => {
    if (!matchesStatus(book, status)) {
      return false;
    }
    if (!matchesQuery(book, query)) {
      return false;
    }
    if (allowedCategoryBookIds && !allowedCategoryBookIds.has(book.id)) {
      return false;
    }
    if (allowedCollectionBookIds && !allowedCollectionBookIds.has(book.id)) {
      return false;
    }
    return true;
  });

  const start = normalizedPage * normalizedSize;
  const end = start + normalizedSize;
  const content = filtered.slice(start, end);
  return createBookPage(content, filtered.length, normalizedPage, normalizedSize);
};
