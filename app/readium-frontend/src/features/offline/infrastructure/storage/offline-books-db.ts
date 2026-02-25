import Dexie, { type Table } from 'dexie';
import type { OfflineBookBlobRecord, OfflineBookDownload } from '../../domain/offline-book';
import type {
  LocalBookCategoryRecord,
  LocalBookCollectionRecord,
  LocalCategoryRecord,
  LocalReadingCollectionRecord,
} from '../../domain/offline-library-metadata';
import type {
  LocalAnnotationRecord,
  LocalReadingProgressRecord,
  OfflineBookSnapshot,
  SyncQueueRecord,
} from '../../domain/offline-sync';

class OfflineBooksDatabase extends Dexie {
  downloads!: Table<OfflineBookDownload, number>;
  downloadBlobs!: Table<OfflineBookBlobRecord, number>;
  booksOffline!: Table<OfflineBookSnapshot, number>;
  readingProgressLocal!: Table<LocalReadingProgressRecord, number>;
  annotationsLocal!: Table<LocalAnnotationRecord, number>;
  syncQueue!: Table<SyncQueueRecord, string>;
  categoriesLocal!: Table<LocalCategoryRecord, number>;
  bookCategoriesLocal!: Table<LocalBookCategoryRecord, [number, number]>;
  readingCollectionsLocal!: Table<LocalReadingCollectionRecord, number>;
  bookCollectionsLocal!: Table<LocalBookCollectionRecord, [number, number]>;

  constructor() {
    super('readiumOfflineBooks');

    this.version(1).stores({
      downloads: 'bookId, downloadedAt, updatedAt',
    });

    this.version(2).stores({
      downloads: 'bookId, downloadedAt, updatedAt',
      books_offline: 'bookId, updatedAt',
      reading_progress_local: 'bookId, syncStatus, updatedAt, syncedAt',
      annotations_local: 'localId, remoteId, bookId, page, syncStatus, updatedAt, deletedAt',
      sync_queue: 'operationId, status, nextRetryAt, updatedAt, [entityType+entityId+operationType]',
    });

    this.version(3).stores({
      downloads: 'bookId, downloadedAt, updatedAt',
      download_blobs: 'bookId, updatedAt',
      books_offline: 'bookId, updatedAt',
      reading_progress_local: 'bookId, syncStatus, updatedAt, syncedAt',
      annotations_local: 'localId, remoteId, bookId, page, syncStatus, updatedAt, deletedAt',
      sync_queue: 'operationId, status, nextRetryAt, updatedAt, [entityType+entityId+operationType]',
    });

    this.version(4).stores({
      downloads: 'bookId, downloadedAt, updatedAt',
      download_blobs: 'bookId, updatedAt',
      books_offline: 'bookId, updatedAt',
      reading_progress_local: 'bookId, syncStatus, updatedAt, syncedAt',
      annotations_local: 'localId, remoteId, bookId, page, syncStatus, updatedAt, deletedAt',
      sync_queue: 'operationId, status, nextRetryAt, updatedAt, [entityType+entityId+operationType]',
      categories_local: 'id, slug, parentId, sortOrder, updatedAt',
      book_categories_local: '[bookId+categoryId], bookId, categoryId, updatedAt',
      reading_collections_local: 'id, slug, sortOrder, updatedAt',
      book_collections_local: '[bookId+collectionId], bookId, collectionId, updatedAt',
    });

    this.downloads = this.table('downloads');
    this.downloadBlobs = this.table('download_blobs');
    this.booksOffline = this.table('books_offline');
    this.readingProgressLocal = this.table('reading_progress_local');
    this.annotationsLocal = this.table('annotations_local');
    this.syncQueue = this.table('sync_queue');
    this.categoriesLocal = this.table('categories_local');
    this.bookCategoriesLocal = this.table('book_categories_local');
    this.readingCollectionsLocal = this.table('reading_collections_local');
    this.bookCollectionsLocal = this.table('book_collections_local');
  }
}

export const offlineBooksDb = new OfflineBooksDatabase();
