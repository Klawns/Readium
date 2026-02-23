import { ReadingCollectionHttpRepository } from '../../infrastructure/api/reading-collection-http-repository';
import {
  CreateReadingCollectionUseCase,
  DeleteReadingCollectionUseCase,
  ListBookCollectionsUseCase,
  ListReadingCollectionsUseCase,
  SetBookCollectionsUseCase,
  UpdateReadingCollectionUseCase,
} from './reading-collection-use-cases';

const repository = new ReadingCollectionHttpRepository();

export const listReadingCollectionsUseCase = new ListReadingCollectionsUseCase(repository);
export const createReadingCollectionUseCase = new CreateReadingCollectionUseCase(repository);
export const updateReadingCollectionUseCase = new UpdateReadingCollectionUseCase(repository);
export const deleteReadingCollectionUseCase = new DeleteReadingCollectionUseCase(repository);
export const listBookCollectionsUseCase = new ListBookCollectionsUseCase(repository);
export const setBookCollectionsUseCase = new SetBookCollectionsUseCase(repository);

