import {
  getConnectionMode,
  type ConnectionMode,
} from '@/features/preferences/application/services/connection-mode-service.ts';
import type { BookStatus } from '@/types';
import { ReaderBookHttpRepository } from '../../infrastructure/api/reader-book-http-repository';
import type { ReaderBookRepository } from '../../domain/ports/ReaderBookRepository';
import { ReaderBookLocalRepository } from '../../infrastructure/local/reader-book-local-repository';
import {
  GetReaderBookFileUrlUseCase,
  GetReaderBookUseCase,
  GetReaderOcrStatusUseCase,
  GetReaderTextLayerQualityUseCase,
  TriggerReaderOcrUseCase,
  UpdateReaderBookStatusUseCase,
} from './reader-book-use-cases';
import { updateBookStatusOfflineFirst } from '@/features/offline/application/services/offline-book-status-sync-service';

interface ReaderBookUseCases {
  getReaderBookUseCase: GetReaderBookUseCase;
  getReaderOcrStatusUseCase: GetReaderOcrStatusUseCase;
  getReaderTextLayerQualityUseCase: GetReaderTextLayerQualityUseCase;
  updateReaderBookStatusUseCase: UpdateReaderBookStatusUseCase;
  triggerReaderOcrUseCase: TriggerReaderOcrUseCase;
  getReaderBookFileUrlUseCase: GetReaderBookFileUrlUseCase;
}

const useCasesByMode = new Map<ConnectionMode, ReaderBookUseCases>();

const createServerRepository = (): ReaderBookRepository => {
  const remoteRepository = new ReaderBookHttpRepository();
  return {
    getBook: (bookId) => remoteRepository.getBook(bookId),
    getOcrStatus: (bookId) => remoteRepository.getOcrStatus(bookId),
    getTextLayerQuality: (bookId) => remoteRepository.getTextLayerQuality(bookId),
    updateBookStatus: (bookId, status) => updateBookStatusOfflineFirst({ bookId, status }),
    triggerOcr: (bookId) => remoteRepository.triggerOcr(bookId),
    getBookFileUrl: (bookId, version) => remoteRepository.getBookFileUrl(bookId, version),
  };
};

const createUseCases = (repository: ReaderBookRepository): ReaderBookUseCases => ({
  getReaderBookUseCase: new GetReaderBookUseCase(repository),
  getReaderOcrStatusUseCase: new GetReaderOcrStatusUseCase(repository),
  getReaderTextLayerQualityUseCase: new GetReaderTextLayerQualityUseCase(repository),
  updateReaderBookStatusUseCase: new UpdateReaderBookStatusUseCase(repository),
  triggerReaderOcrUseCase: new TriggerReaderOcrUseCase(repository),
  getReaderBookFileUrlUseCase: new GetReaderBookFileUrlUseCase(repository),
});

const resolveUseCases = (): ReaderBookUseCases => {
  const mode = getConnectionMode();
  const existing = useCasesByMode.get(mode);
  if (existing) {
    return existing;
  }

  const repository = mode === 'LOCAL'
    ? new ReaderBookLocalRepository()
    : createServerRepository();
  const created = createUseCases(repository);
  useCasesByMode.set(mode, created);
  return created;
};

export const getReaderBookUseCase = {
  execute: (bookId: number) => resolveUseCases().getReaderBookUseCase.execute(bookId),
};

export const getReaderOcrStatusUseCase = {
  execute: (bookId: number) => resolveUseCases().getReaderOcrStatusUseCase.execute(bookId),
};

export const getReaderTextLayerQualityUseCase = {
  execute: (bookId: number) => resolveUseCases().getReaderTextLayerQualityUseCase.execute(bookId),
};

export const updateReaderBookStatusUseCase = {
  execute: (bookId: number, status: BookStatus) =>
    resolveUseCases().updateReaderBookStatusUseCase.execute(bookId, status),
};

export const triggerReaderOcrUseCase = {
  execute: (bookId: number) => resolveUseCases().triggerReaderOcrUseCase.execute(bookId),
};

export const getReaderBookFileUrlUseCase = {
  execute: (bookId: number, version?: string | null) =>
    resolveUseCases().getReaderBookFileUrlUseCase.execute(bookId, version),
};

