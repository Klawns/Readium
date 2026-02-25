import { ReaderProgressOfflineRepository } from '../../infrastructure/offline/reader-progress-offline-repository';
import {
  SaveReaderProgressUseCase,
} from './reader-progress-use-cases';

const readerProgressRepository = new ReaderProgressOfflineRepository();

export const saveReaderProgressUseCase = new SaveReaderProgressUseCase(readerProgressRepository);
