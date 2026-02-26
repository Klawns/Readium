import { AnnotationHttpRepository } from '@/features/reader/infrastructure/api/annotation-http-repository';
import { syncBookAnnotationsIfPossible } from './offline-annotation-sync-runtime';

const annotationRepository = new AnnotationHttpRepository();

export const prefetchOfflineBookAnnotations = async (bookId: number): Promise<void> => {
  if (!Number.isFinite(bookId) || bookId <= 0) {
    return;
  }

  await syncBookAnnotationsIfPossible(bookId, annotationRepository);
};
