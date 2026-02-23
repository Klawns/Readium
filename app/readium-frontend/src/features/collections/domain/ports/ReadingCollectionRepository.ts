import type { ReadingCollection } from '@/types';

export interface SaveReadingCollectionCommand {
  name: string;
  description?: string | null;
  color?: string;
  icon?: string;
}

export interface ReadingCollectionRepository {
  list(query?: string): Promise<ReadingCollection[]>;
  create(command: SaveReadingCollectionCommand): Promise<ReadingCollection>;
  update(collectionId: number, command: SaveReadingCollectionCommand): Promise<ReadingCollection>;
  delete(collectionId: number): Promise<void>;
  listByBook(bookId: number): Promise<ReadingCollection[]>;
  setBookCollections(bookId: number, collectionIds: number[]): Promise<ReadingCollection[]>;
}

