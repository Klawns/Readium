import type { CreateAnnotationCommand } from '@/features/reader/domain/ports/AnnotationRepository';
import type { ReaderAnnotation } from '@/features/reader/domain/models';
import { offlineBooksDb } from '../../infrastructure/storage/offline-books-db';
import {
  toCreateAnnotationCommand,
  toReaderAnnotation,
} from './offline-annotation-local-mapper';

const isActiveRecord = (record: { deletedAt: string | null }): boolean => !record.deletedAt;

const sortAnnotations = (annotations: ReaderAnnotation[]): ReaderAnnotation[] =>
  annotations.sort((left, right) =>
    left.page !== right.page ? left.page - right.page : left.id - right.id,
  );

export const getLocalAnnotationRecord = async (localId: number) =>
  offlineBooksDb.annotationsLocal.get(localId);

export const listLocalAnnotationsByBook = async (bookId: number): Promise<ReaderAnnotation[]> => {
  const records = await offlineBooksDb.annotationsLocal.where('bookId').equals(bookId).toArray();
  return sortAnnotations(records.filter(isActiveRecord).map(toReaderAnnotation));
};

export const listLocalAnnotationsByBookAndPage = async (
  bookId: number,
  page: number,
): Promise<ReaderAnnotation[]> => {
  const records = await offlineBooksDb.annotationsLocal.where('bookId').equals(bookId).toArray();
  return sortAnnotations(
    records
      .filter((record) => isActiveRecord(record) && record.page === page)
      .map(toReaderAnnotation),
  );
};

export const toCreateAnnotationFromLocalId = async (
  localId: number,
): Promise<CreateAnnotationCommand | null> => {
  const record = await getLocalAnnotationRecord(localId);
  if (!record || !isActiveRecord(record)) {
    return null;
  }
  return toCreateAnnotationCommand(record);
};
