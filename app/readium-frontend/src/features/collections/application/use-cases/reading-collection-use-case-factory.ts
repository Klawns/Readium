import {
  getConnectionMode,
  type ConnectionMode,
} from '@/features/preferences/application/services/connection-mode-service.ts';
import { ReadingCollectionHttpRepository } from '../../infrastructure/api/reading-collection-http-repository';
import { ReadingCollectionLocalRepository } from '../../infrastructure/local/reading-collection-local-repository';
import type { ReadingCollectionRepository } from '../../domain/ports/ReadingCollectionRepository';
import {
  CreateReadingCollectionUseCase,
  DeleteReadingCollectionUseCase,
  ListBookCollectionsUseCase,
  ListReadingCollectionsUseCase,
  MoveReadingCollectionUseCase,
  SetBookCollectionsUseCase,
  UpdateReadingCollectionUseCase,
} from './reading-collection-use-cases';

export interface ReadingCollectionUseCases {
  listReadingCollectionsUseCase: ListReadingCollectionsUseCase;
  createReadingCollectionUseCase: CreateReadingCollectionUseCase;
  updateReadingCollectionUseCase: UpdateReadingCollectionUseCase;
  moveReadingCollectionUseCase: MoveReadingCollectionUseCase;
  deleteReadingCollectionUseCase: DeleteReadingCollectionUseCase;
  listBookCollectionsUseCase: ListBookCollectionsUseCase;
  setBookCollectionsUseCase: SetBookCollectionsUseCase;
}

const useCasesByMode = new Map<ConnectionMode, ReadingCollectionUseCases>();

const createUseCases = (repository: ReadingCollectionRepository): ReadingCollectionUseCases => ({
  listReadingCollectionsUseCase: new ListReadingCollectionsUseCase(repository),
  createReadingCollectionUseCase: new CreateReadingCollectionUseCase(repository),
  updateReadingCollectionUseCase: new UpdateReadingCollectionUseCase(repository),
  moveReadingCollectionUseCase: new MoveReadingCollectionUseCase(repository),
  deleteReadingCollectionUseCase: new DeleteReadingCollectionUseCase(repository),
  listBookCollectionsUseCase: new ListBookCollectionsUseCase(repository),
  setBookCollectionsUseCase: new SetBookCollectionsUseCase(repository),
});

const resolveRepositoryForMode = (mode: ConnectionMode): ReadingCollectionRepository =>
  mode === 'LOCAL' ? new ReadingCollectionLocalRepository() : new ReadingCollectionHttpRepository();

export const getReadingCollectionUseCases = (): ReadingCollectionUseCases => {
  const mode = getConnectionMode();
  const existing = useCasesByMode.get(mode);
  if (existing) {
    return existing;
  }

  const created = createUseCases(resolveRepositoryForMode(mode));
  useCasesByMode.set(mode, created);
  return created;
};
