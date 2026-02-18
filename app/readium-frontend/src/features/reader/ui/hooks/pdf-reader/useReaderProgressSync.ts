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
}

export const useReaderProgressSync = ({ bookId, currentPage }: UseReaderProgressSyncParams) => {
  const queryClient = useQueryClient();
  const currentPageRef = useRef(currentPage);
  const timeoutRef = useRef<number | null>(null);
  const lastSavedPageRef = useRef<number | null>(null);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    currentPageRef.current = currentPage;
    lastSavedPageRef.current = null;
  }, [bookId, currentPage]);

  const persistProgress = useCallback(async (page: number, keepalive = false) => {
    if (page <= 0) {
      return;
    }

    await saveReaderProgressUseCase.execute({ bookId, page, keepalive });
    lastSavedPageRef.current = page;

    queryClient.setQueryData<Book | undefined>(queryKeys.book(bookId), (cachedBook) => {
      if (!cachedBook) {
        return cachedBook;
      }
      return {
        ...cachedBook,
        lastReadPage: page,
      };
    });

    queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
  }, [bookId, queryClient]);

  const flushProgress = useCallback((keepalive = false) => {
    const page = currentPageRef.current;
    if (page <= 0) {
      return;
    }
    if (!keepalive && lastSavedPageRef.current === page) {
      return;
    }
    void persistProgress(page, keepalive).catch((error: unknown) => {
      logger.error('failed to save progress', error);
    });
  }, [persistProgress]);

  useEffect(() => {
    if (currentPage <= 0) {
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
  }, [currentPage, flushProgress]);

  useEffect(() => {
    return () => {
      flushProgress();
    };
  }, [flushProgress]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushProgress(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushProgress]);
};
