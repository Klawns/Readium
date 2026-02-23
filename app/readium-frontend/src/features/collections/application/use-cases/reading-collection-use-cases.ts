import type { ReadingCollection } from '@/types';
import type {
  ReadingCollectionRepository,
  SaveReadingCollectionCommand,
} from '../../domain/ports/ReadingCollectionRepository';

export class ListReadingCollectionsUseCase {
  constructor(private readonly repository: ReadingCollectionRepository) {}

  execute(query?: string): Promise<ReadingCollection[]> {
    return this.repository.list(query);
  }
}

export class CreateReadingCollectionUseCase {
  constructor(private readonly repository: ReadingCollectionRepository) {}

  execute(command: SaveReadingCollectionCommand): Promise<ReadingCollection> {
    return this.repository.create(command);
  }
}

export class UpdateReadingCollectionUseCase {
  constructor(private readonly repository: ReadingCollectionRepository) {}

  execute(collectionId: number, command: SaveReadingCollectionCommand): Promise<ReadingCollection> {
    return this.repository.update(collectionId, command);
  }
}

export class DeleteReadingCollectionUseCase {
  constructor(private readonly repository: ReadingCollectionRepository) {}

  execute(collectionId: number): Promise<void> {
    return this.repository.delete(collectionId);
  }
}

export class MoveReadingCollectionUseCase {
  constructor(private readonly repository: ReadingCollectionRepository) {}

  execute(collectionId: number, targetIndex: number): Promise<ReadingCollection> {
    return this.repository.move(collectionId, targetIndex);
  }
}

export class ListBookCollectionsUseCase {
  constructor(private readonly repository: ReadingCollectionRepository) {}

  execute(bookId: number): Promise<ReadingCollection[]> {
    return this.repository.listByBook(bookId);
  }
}

export class SetBookCollectionsUseCase {
  constructor(private readonly repository: ReadingCollectionRepository) {}

  execute(bookId: number, collectionIds: number[]): Promise<ReadingCollection[]> {
    return this.repository.setBookCollections(bookId, collectionIds);
  }
}
