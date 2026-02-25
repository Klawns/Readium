import {
  getConnectionMode,
  type ConnectionMode,
} from '@/features/preferences/application/services/connection-mode-service.ts';
import { createLibraryUseCases } from '../application/use-cases/library-use-cases';
import { BookHttpRepository } from './api/book-http-repository';
import { BookLocalRepository } from './local/book-local-repository';
import { updateBookStatusOfflineFirst } from '@/features/offline/application/services/offline-book-status-sync-service';
import type { BookStatus } from '@/types';
import type { LibraryUseCases } from '../application/use-cases/library-use-cases';

const useCasesByMode = new Map<ConnectionMode, LibraryUseCases>();

const createServerUseCases = (): LibraryUseCases => {
  const repository = new BookHttpRepository();
  const baseUseCases = createLibraryUseCases(repository);

  return {
    ...baseUseCases,
    updateBookStatus: (bookId: number, status: BookStatus) =>
      updateBookStatusOfflineFirst({ bookId, status }),
  };
};

const createLocalUseCases = (): LibraryUseCases => createLibraryUseCases(new BookLocalRepository());

export const getLibraryUseCases = (): LibraryUseCases => {
  const mode = getConnectionMode();
  const existing = useCasesByMode.get(mode);
  if (existing) {
    return existing;
  }

  const created = mode === 'LOCAL' ? createLocalUseCases() : createServerUseCases();
  useCasesByMode.set(mode, created);
  return created;
};
