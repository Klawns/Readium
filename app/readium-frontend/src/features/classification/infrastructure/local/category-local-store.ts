import type {
  LocalBookCategoryRecord,
  LocalCategoryRecord,
} from '@/features/offline/domain/offline-library-metadata';
import { offlineBooksDb } from '@/features/offline/infrastructure/storage/offline-books-db';

export const listLocalCategoryRecords = (): Promise<LocalCategoryRecord[]> =>
  offlineBooksDb.categoriesLocal.toArray();

export const getLocalCategoryRecord = (categoryId: number): Promise<LocalCategoryRecord | undefined> =>
  offlineBooksDb.categoriesLocal.get(categoryId);

export const saveLocalCategoryRecord = async (record: LocalCategoryRecord): Promise<void> => {
  await offlineBooksDb.categoriesLocal.put(record);
};

export const saveLocalCategoryRecords = async (records: LocalCategoryRecord[]): Promise<void> => {
  if (records.length === 0) {
    return;
  }
  await offlineBooksDb.categoriesLocal.bulkPut(records);
};

export const removeLocalCategoryRecord = async (categoryId: number): Promise<void> => {
  await offlineBooksDb.categoriesLocal.delete(categoryId);
};

export const listLocalBookCategoryRecords = (): Promise<LocalBookCategoryRecord[]> =>
  offlineBooksDb.bookCategoriesLocal.toArray();

export const listLocalBookCategoryRecordsByBook = (bookId: number): Promise<LocalBookCategoryRecord[]> =>
  offlineBooksDb.bookCategoriesLocal.where('bookId').equals(bookId).toArray();

export const listLocalBookCategoryRecordsByCategory = (categoryId: number): Promise<LocalBookCategoryRecord[]> =>
  offlineBooksDb.bookCategoriesLocal.where('categoryId').equals(categoryId).toArray();

export const replaceLocalBookCategoryRecordsByBook = async (
  bookId: number,
  categoryIds: number[],
  updatedAt: string,
): Promise<void> => {
  await offlineBooksDb.transaction('rw', offlineBooksDb.bookCategoriesLocal, async () => {
    const existing = await listLocalBookCategoryRecordsByBook(bookId);
    if (existing.length > 0) {
      await offlineBooksDb.bookCategoriesLocal.bulkDelete(
        existing.map((record) => [record.bookId, record.categoryId] as [number, number]),
      );
    }

    if (categoryIds.length === 0) {
      return;
    }

    const nextRecords: LocalBookCategoryRecord[] = categoryIds.map((categoryId) => ({
      bookId,
      categoryId,
      updatedAt,
    }));
    await offlineBooksDb.bookCategoriesLocal.bulkPut(nextRecords);
  });
};

export const removeLocalBookCategoryRecordsByCategory = async (categoryId: number): Promise<void> => {
  const records = await listLocalBookCategoryRecordsByCategory(categoryId);
  if (records.length === 0) {
    return;
  }

  await offlineBooksDb.bookCategoriesLocal.bulkDelete(
    records.map((record) => [record.bookId, record.categoryId] as [number, number]),
  );
};

