import { ReaderProgressHttpRepository } from '../../infrastructure/api/reader-progress-http-repository';
import {
  SaveReaderProgressUseCase,
} from './reader-progress-use-cases';

const readerProgressRepository = new ReaderProgressHttpRepository();

export const saveReaderProgressUseCase = new SaveReaderProgressUseCase(readerProgressRepository);
