import { useEffect } from 'react';
import { createLogger } from '@/lib/logger.ts';

const logger = createLogger('reader');

interface UseReaderLifecycleDebugParams {
  bookId: number;
  fileUrl: string;
  initialPage: number;
  engineLoading: boolean;
  hasEngine: boolean;
  readerLoading: boolean;
  currentPage: number;
  annotationsCount: number;
  translationsCount: number;
}

export const useReaderLifecycleDebug = ({
  bookId,
  fileUrl,
  initialPage,
  engineLoading,
  hasEngine,
  readerLoading,
  currentPage,
  annotationsCount,
  translationsCount,
}: UseReaderLifecycleDebugParams) => {
  useEffect(() => {
    logger.debug('reader mount', { bookId, fileUrl, initialPage });
    return () => {
      logger.debug('reader unmount', { bookId, fileUrl });
    };
  }, [bookId, fileUrl, initialPage]);

  useEffect(() => {
    logger.debug('engine state', {
      engineLoading,
      hasEngine,
    });
  }, [engineLoading, hasEngine]);

  useEffect(() => {
    logger.debug('reader data state', {
      readerLoading,
      currentPage,
      annotationsCount,
      translationsCount,
    });
  }, [readerLoading, currentPage, annotationsCount, translationsCount]);
};
