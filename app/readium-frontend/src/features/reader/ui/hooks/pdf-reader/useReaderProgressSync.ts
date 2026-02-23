import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createLogger } from '@/lib/logger.ts';
import type { Book } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import { saveReaderProgressUseCase } from '../../../application/use-cases/reader-progress-use-case-factory';
import { PROGRESS_SAVE_DEBOUNCE_MS } from './pdfReader.constants';

const logger = createLogger('reader');

interface UseReaderProgressSyncParams {
  bookId: number;
  currentPage: number;
  initialPage: number;
}

export const useReaderProgressSync = ({ bookId, currentPage, initialPage }: UseReaderProgressSyncParams) => {
  const queryClient = useQueryClient();
  const currentPageRef = useRef(currentPage);
  const timeoutRef = useRef<number | null>(null);
  const lastSavedPageRef = useRef<number | null>(null);
  const previousBookIdRef = useRef(bookId);
  const sessionInitialPageRef = useRef(initialPage);
  const skipFirstCurrentPageSampleRef = useRef(true);
  const hasSeenNonFirstPageRef = useRef(false);

  if (previousBookIdRef.current !== bookId) {
    previousBookIdRef.current = bookId;
    sessionInitialPageRef.current = initialPage;
    currentPageRef.current = currentPage;
    lastSavedPageRef.current = null;
    skipFirstCurrentPageSampleRef.current = true;
    hasSeenNonFirstPageRef.current = false;
  }

  useEffect(() => {
    currentPageRef.current = currentPage;

    if (skipFirstCurrentPageSampleRef.current) {
      skipFirstCurrentPageSampleRef.current = false;
      return;
    }

    if (currentPage > 1) {
      hasSeenNonFirstPageRef.current = true;
    }
  }, [bookId, currentPage]);

  const canPersistPage = useCallback((page: number) => {
    if (page <= 0) {
      return false;
    }

    if (page !== 1) {
      return true;
    }

    if (sessionInitialPageRef.current <= 1) {
      return true;
    }

    // Evita sobrescrever progresso com pagina 1 durante bootstrap/transicoes do viewport.
    return hasSeenNonFirstPageRef.current;
  }, []);

  const persistProgress = useCallback(async (page: number, keepalive = false) => {
    if (!canPersistPage(page)) {
      return;
    }

    await saveReaderProgressUseCase.execute({ bookId, page, keepalive });
    lastSavedPageRef.current = page;

    queryClient.setQueryData<Book | undefined>(queryKeys.book(bookId), (cachedBook) => {
      if (!cachedBook) {
        return cachedBook;
      }
      const cachedLastReadPage = Math.max(0, cachedBook.lastReadPage ?? 0);
      return {
        ...cachedBook,
        lastReadPage: Math.max(cachedLastReadPage, page),
      };
    });

    queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
  }, [bookId, canPersistPage, queryClient]);

  const flushProgress = useCallback((keepalive = false) => {
    const page = currentPageRef.current;
    if (!canPersistPage(page)) {
      return;
    }
    if (!keepalive && lastSavedPageRef.current === page) {
      return;
    }
    void persistProgress(page, keepalive).catch((error: unknown) => {
      logger.error('failed to save progress', error);
    });
  }, [canPersistPage, persistProgress]);

  useEffect(() => {
    if (!canPersistPage(currentPage)) {
      return;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      flushProgress();
      timeoutRef.current = null;
    }, PROGRESS_SAVE_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [canPersistPage, currentPage, flushProgress]);

  useEffect(() => {
    return () => {
      flushProgress();
    };
  }, [flushProgress]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushProgress(true);
    };
    const handlePageHide = () => {
      flushProgress(true);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushProgress(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushProgress]);
};
