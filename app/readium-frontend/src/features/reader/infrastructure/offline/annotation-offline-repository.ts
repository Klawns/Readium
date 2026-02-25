import type {
  AnnotationRepository,
  CreateAnnotationCommand,
  UpdateAnnotationCommand,
} from '../../domain/ports/AnnotationRepository';
import type { ReaderAnnotation } from '../../domain/models';
import { AnnotationHttpRepository } from '../api/annotation-http-repository';
import {
  createAnnotationOfflineFirst,
  deleteAnnotationOfflineFirst,
  getAnnotationsByBookAndPageOfflineFirst,
  getAnnotationsByBookOfflineFirst,
  updateAnnotationOfflineFirst,
} from '@/features/offline/application/services/offline-annotation-sync-service';

export class AnnotationOfflineRepository implements AnnotationRepository {
  constructor(private readonly remoteRepository: AnnotationHttpRepository) {}

  getByBook(bookId: number): Promise<ReaderAnnotation[]> {
    return getAnnotationsByBookOfflineFirst(bookId, this.remoteRepository);
  }

  getByBookAndPage(bookId: number, page: number): Promise<ReaderAnnotation[]> {
    return getAnnotationsByBookAndPageOfflineFirst(bookId, page, this.remoteRepository);
  }

  create(command: CreateAnnotationCommand): Promise<ReaderAnnotation> {
    return createAnnotationOfflineFirst(command, this.remoteRepository);
  }

  update(command: UpdateAnnotationCommand): Promise<ReaderAnnotation> {
    return updateAnnotationOfflineFirst(command, this.remoteRepository);
  }

  delete(id: number): Promise<void> {
    return deleteAnnotationOfflineFirst(id, this.remoteRepository);
  }
}
