import type {
  LocalBookCollectionRecord,
  LocalReadingCollectionRecord,
} from '@/features/offline/domain/offline-library-metadata';
import { offlineBooksDb } from '@/features/offline/infrastructure/storage/offline-books-db';

export const listLocalReadingCollectionRecords = (): Promise<LocalReadingCollectionRecord[]> =>
  offlineBooksDb.readingCollectionsLocal.toArray();

export const getLocalReadingCollectionRecord = (collectionId: number): Promise<LocalReadingCollectionRecord | undefined> =>
  offlineBooksDb.readingCollectionsLocal.get(collectionId);

export const saveLocalReadingCollectionRecord = async (record: LocalReadingCollectionRecord): Promise<void> => {
  await offlineBooksDb.readingCollectionsLocal.put(record);
};

export const saveLocalReadingCollectionRecords = async (records: LocalReadingCollectionRecord[]): Promise<void> => {
  if (records.length === 0) {
    return;
  }
  await offlineBooksDb.readingCollectionsLocal.bulkPut(records);
};

export const removeLocalReadingCollectionRecord = async (collectionId: number): Promise<void> => {
  await offlineBooksDb.readingCollectionsLocal.delete(collectionId);
};

export const listLocalBookCollectionRecords = (): Promise<LocalBookCollectionRecord[]> =>
  offlineBooksDb.bookCollectionsLocal.toArray();

export const listLocalBookCollectionRecordsByBook = (bookId: number): Promise<LocalBookCollectionRecord[]> =>
  offlineBooksDb.bookCollectionsLocal.where('bookId').equals(bookId).toArray();

export const listLocalBookCollectionRecordsByCollection = (
  collectionId: number,
): Promise<LocalBookCollectionRecord[]> =>
  offlineBooksDb.bookCollectionsLocal.where('collectionId').equals(collectionId).toArray();

export const replaceLocalBookCollectionRecordsByBook = async (
  bookId: number,
  collectionIds: number[],
  updatedAt: string,
): Promise<void> => {
  await offlineBooksDb.transaction('rw', offlineBooksDb.bookCollectionsLocal, async () => {
    const existing = await listLocalBookCollectionRecordsByBook(bookId);
    if (existing.length > 0) {
      await offlineBooksDb.bookCollectionsLocal.bulkDelete(
        existing.map((record) => [record.bookId, record.collectionId] as [number, number]),
      );
    }

    if (collectionIds.length === 0) {
      return;
    }

    const nextRecords: LocalBookCollectionRecord[] = collectionIds.map((collectionId) => ({
      bookId,
      collectionId,
      updatedAt,
    }));
    await offlineBooksDb.bookCollectionsLocal.bulkPut(nextRecords);
  });
};

export const removeLocalBookCollectionRecordsByCollection = async (collectionId: number): Promise<void> => {
  const records = await listLocalBookCollectionRecordsByCollection(collectionId);
  if (records.length === 0) {
    return;
  }

  await offlineBooksDb.bookCollectionsLocal.bulkDelete(
    records.map((record) => [record.bookId, record.collectionId] as [number, number]),
  );
};

