import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createLogger } from '@/lib/logger.ts';
import type { Book, BookStatus } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import { saveReaderProgressUseCase } from '../../../application/use-cases/reader-progress-use-case-factory';
import type { ReaderProgressUpdateMode } from '../../../domain/ports/ReaderProgressRepository';
import { PROGRESS_SAVE_DEBOUNCE_MS } from './pdfReader.constants';
import { useReaderProgressLifecycle } from './useReaderProgressLifecycle';

const logger = createLogger('reader');

interface UseReaderProgressSyncParams {
  bookId: number;
  currentPage: number;
  initialPage: number;
}

const clearTimeoutSafely = (timeoutRef: MutableRefObject<number | null>) => {
  if (timeoutRef.current === null) {
    return;
  }
  window.clearTimeout(timeoutRef.current);
  timeoutRef.current = null;
};

const resolveStatusFromExactProgress = (cachedBook: Book, page: number): BookStatus => {
  const safePage = Math.max(0, Math.floor(page));
  const totalPages = Math.max(0, Math.floor(cachedBook.pages ?? 0));

  if (totalPages > 0 && safePage >= totalPages) {
    return 'READ';
  }
  if (safePage <= 0) {
    return 'TO_READ';
  }
  return 'READING';
};

const updateCachedBookProgress = (
  cachedBook: Book,
  page: number,
  mode: ReaderProgressUpdateMode,
): Book => {
  const safePage = Math.max(0, Math.floor(page));
  const totalPages = Math.max(0, Math.floor(cachedBook.pages ?? 0));
  const boundedPage = totalPages > 0 ? Math.min(safePage, totalPages) : safePage;

  if (mode === 'EXACT') {
    return {
      ...cachedBook,
      lastReadPage: boundedPage,
      status: resolveStatusFromExactProgress(cachedBook, boundedPage),
    };
  }

  const cachedLastReadPage = Math.max(0, cachedBook.lastReadPage ?? 0);
  const nextPage = Math.max(cachedLastReadPage, boundedPage);
  let nextStatus = cachedBook.status;

  if (nextPage > 0 && nextStatus === 'TO_READ') {
    nextStatus = 'READING';
  }
  if (totalPages > 0 && nextPage >= totalPages) {
    nextStatus = 'READ';
  }

  return {
    ...cachedBook,
    lastReadPage: nextPage,
    status: nextStatus,
  };
};

export const useReaderProgressSync = ({ bookId, currentPage, initialPage }: UseReaderProgressSyncParams) => {
  const [isSavingManualProgress, setIsSavingManualProgress] = useState(false);
  const queryClient = useQueryClient();
  const currentPageRef = useRef(currentPage);
  const timeoutRef = useRef<number | null>(null);
  const lastSavedPageRef = useRef<number | null>(null);
  const previousBookIdRef = useRef(bookId);
  const sessionInitialPageRef = useRef(initialPage);
  const skipFirstCurrentPageSampleRef = useRef(true);
  const hasSeenNonFirstPageRef = useRef(false);
  const blockFirstPagePersistenceRef = useRef(false);

  if (previousBookIdRef.current !== bookId) {
    previousBookIdRef.current = bookId;
    sessionInitialPageRef.current = initialPage;
    currentPageRef.current = currentPage;
    lastSavedPageRef.current = null;
    skipFirstCurrentPageSampleRef.current = true;
    hasSeenNonFirstPageRef.current = false;
    blockFirstPagePersistenceRef.current = false;
  }

  useEffect(() => {
    currentPageRef.current = currentPage;

    if (skipFirstCurrentPageSampleRef.current) {
      skipFirstCurrentPageSampleRef.current = false;
      return;
    }

    if (currentPage > 1) {
      hasSeenNonFirstPageRef.current = true;
      blockFirstPagePersistenceRef.current = false;
    }
  }, [bookId, currentPage]);

  const canPersistPage = useCallback((page: number) => {
    if (page <= 0) {
      return false;
    }

    if (page !== 1) {
      return true;
    }

    if (blockFirstPagePersistenceRef.current) {
      return false;
    }

    if (sessionInitialPageRef.current <= 1) {
      return true;
    }

    // Evita sobrescrever progresso com pagina 1 durante bootstrap/transicoes do viewport.
    return hasSeenNonFirstPageRef.current;
  }, []);

  const persistProgress = useCallback(async ({
    page,
    keepalive = false,
    mode = 'MAX',
    skipCanPersistCheck = false,
  }: {
    page: number;
    keepalive?: boolean;
    mode?: ReaderProgressUpdateMode;
    skipCanPersistCheck?: boolean;
  }) => {
    const safePage = Number.isFinite(page) ? Math.max(0, Math.floor(page)) : 0;

    if (!skipCanPersistCheck && !canPersistPage(safePage)) {
      return;
    }

    await saveReaderProgressUseCase.execute({ bookId, page: safePage, keepalive, mode });
    lastSavedPageRef.current = safePage;

    queryClient.setQueryData<Book | undefined>(queryKeys.book(bookId), (cachedBook) => {
      if (!cachedBook) {
        return cachedBook;
      }
      return updateCachedBookProgress(cachedBook, safePage, mode);
    });

    queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
    queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot(), refetchType: 'inactive' });
  }, [bookId, canPersistPage, queryClient]);

  const flushProgress = useCallback((keepalive = false) => {
    const page = currentPageRef.current;
    if (!canPersistPage(page)) {
      return;
    }
    if (!keepalive && lastSavedPageRef.current === page) {
      return;
    }
    void persistProgress({ page, keepalive, mode: 'MAX' }).catch((error: unknown) => {
      logger.error('failed to save progress', error);
    });
  }, [canPersistPage, persistProgress]);

  useEffect(() => {
    if (!canPersistPage(currentPage)) {
      return;
    }
    clearTimeoutSafely(timeoutRef);

    timeoutRef.current = window.setTimeout(() => {
      flushProgress();
      timeoutRef.current = null;
    }, PROGRESS_SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeoutSafely(timeoutRef);
    };
  }, [canPersistPage, currentPage, flushProgress]);

  const setManualProgressPage = useCallback(async (page: number) => {
    const safePage = Number.isFinite(page) ? Math.floor(page) : -1;
    if (safePage < 1) {
      throw new Error('Pagina manual invalida.');
    }

    setIsSavingManualProgress(true);
    try {
      clearTimeoutSafely(timeoutRef);
      currentPageRef.current = safePage;
      hasSeenNonFirstPageRef.current = safePage > 1;
      blockFirstPagePersistenceRef.current = false;
      await persistProgress({
        page: safePage,
        keepalive: false,
        mode: 'EXACT',
        skipCanPersistCheck: true,
      });
    } finally {
      setIsSavingManualProgress(false);
    }
  }, [persistProgress]);

  const resetManualProgress = useCallback(async () => {
    setIsSavingManualProgress(true);
    try {
      clearTimeoutSafely(timeoutRef);
      currentPageRef.current = 1;
      hasSeenNonFirstPageRef.current = false;
      blockFirstPagePersistenceRef.current = true;
      await persistProgress({
        page: 0,
        keepalive: false,
        mode: 'EXACT',
        skipCanPersistCheck: true,
      });
    } finally {
      setIsSavingManualProgress(false);
    }
  }, [persistProgress]);

  useReaderProgressLifecycle({ flushProgress });

  return {
    setManualProgressPage,
    resetManualProgress,
    isSavingManualProgress,
  };
};
