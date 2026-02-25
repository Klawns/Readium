import type { ReaderAnnotation } from '@/features/reader/domain/models';
import {
  listLocalAnnotationsByBook,
  listLocalAnnotationsByBookAndPage,
} from './offline-annotation-store-service';
import {
  syncBookAnnotationsIfPossible,
  type AnnotationRemoteRepository,
} from './offline-annotation-sync-runtime';

export const getAnnotationsByBookOfflineFirst = async (
  bookId: number,
  remoteRepository: AnnotationRemoteRepository,
): Promise<ReaderAnnotation[]> => {
  await syncBookAnnotationsIfPossible(bookId, remoteRepository);
  return listLocalAnnotationsByBook(bookId);
};

export const getAnnotationsByBookAndPageOfflineFirst = async (
  bookId: number,
  page: number,
  remoteRepository: AnnotationRemoteRepository,
): Promise<ReaderAnnotation[]> => {
  await syncBookAnnotationsIfPossible(bookId, remoteRepository);
  return listLocalAnnotationsByBookAndPage(bookId, page);
};
