import { ReaderBookHttpRepository } from '../../infrastructure/api/reader-book-http-repository';
import {
  GetReaderBookFileUrlUseCase,
  GetReaderBookUseCase,
  GetReaderOcrStatusUseCase,
  GetReaderTextLayerQualityUseCase,
  TriggerReaderOcrUseCase,
  UpdateReaderBookStatusUseCase,
} from './reader-book-use-cases';

const repository = new ReaderBookHttpRepository();

export const getReaderBookUseCase = new GetReaderBookUseCase(repository);
export const getReaderOcrStatusUseCase = new GetReaderOcrStatusUseCase(repository);
export const getReaderTextLayerQualityUseCase = new GetReaderTextLayerQualityUseCase(repository);
export const updateReaderBookStatusUseCase = new UpdateReaderBookStatusUseCase(repository);
export const triggerReaderOcrUseCase = new TriggerReaderOcrUseCase(repository);
export const getReaderBookFileUrlUseCase = new GetReaderBookFileUrlUseCase(repository);

