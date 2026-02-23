import { collectionApi } from '@/services/collectionApi.ts';
import type { ReadingCollection } from '@/types';
import type {
  ReadingCollectionRepository,
  SaveReadingCollectionCommand,
} from '../../domain/ports/ReadingCollectionRepository';

export class ReadingCollectionHttpRepository implements ReadingCollectionRepository {
  list(query?: string): Promise<ReadingCollection[]> {
    return collectionApi.getCollections(query);
  }

  create(command: SaveReadingCollectionCommand): Promise<ReadingCollection> {
    return collectionApi.createCollection(command);
  }

  update(collectionId: number, command: SaveReadingCollectionCommand): Promise<ReadingCollection> {
    return collectionApi.updateCollection(collectionId, command);
  }

  move(collectionId: number, targetIndex: number): Promise<ReadingCollection> {
    return collectionApi.moveCollection(collectionId, { targetIndex });
  }

  delete(collectionId: number): Promise<void> {
    return collectionApi.deleteCollection(collectionId);
  }

  listByBook(bookId: number): Promise<ReadingCollection[]> {
    return collectionApi.getBookCollections(bookId);
  }

  setBookCollections(bookId: number, collectionIds: number[]): Promise<ReadingCollection[]> {
    return collectionApi.setBookCollections(bookId, collectionIds);
  }
}
