import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  getReaderBookFileUrlUseCase,
  getReaderBookUseCase,
  getReaderOcrStatusUseCase,
  getReaderTextLayerQualityUseCase,
} from '../../application/use-cases/reader-book-use-case-factory';
import { useReaderBookActions } from './useReaderBookActions';
import { useReaderOfflineBookSource } from './useReaderOfflineBookSource';
import { useReaderOcrFailureNotice } from './useReaderOcrFailureNotice';

const OCR_POLLING_INTERVAL_MS = 2000;

export const useReaderBook = (bookId: number) => {
  const isValidBookId = Number.isFinite(bookId) && bookId > 0;

  const bookQuery = useQuery({
    queryKey: queryKeys.book(bookId),
    queryFn: () => getReaderBookUseCase.execute(bookId),
    enabled: isValidBookId,
  });

  const ocrStatusQuery = useQuery({
    queryKey: queryKeys.bookOcrStatus(bookId),
    queryFn: () => getReaderOcrStatusUseCase.execute(bookId),
    enabled: isValidBookId,
    retry: 1,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PENDING' || status === 'RUNNING') {
        return OCR_POLLING_INTERVAL_MS;
      }
      return false;
    },
  });

  const textLayerQualityQuery = useQuery({
    queryKey: queryKeys.bookTextLayerQuality(bookId),
    queryFn: () => getReaderTextLayerQualityUseCase.execute(bookId),
    enabled: isValidBookId && Boolean(ocrStatusQuery.data),
    retry: 1,
    refetchInterval:
      ocrStatusQuery.data?.status === 'PENDING' || ocrStatusQuery.data?.status === 'RUNNING'
        ? OCR_POLLING_INTERVAL_MS
        : false,
  });

  const fileVersion = ocrStatusQuery.data?.updatedAt ?? null;
  const remoteFileUrl = getReaderBookFileUrlUseCase.execute(bookId, fileVersion);
  const readerActions = useReaderBookActions({ bookId });
  const readerOfflineSource = useReaderOfflineBookSource({
    bookId,
    isValidBookId,
    remoteBook: bookQuery.data,
    remoteFileUrl,
  });

  useReaderOcrFailureNotice({ ocrStatus: ocrStatusQuery.data });

  return {
    book: readerOfflineSource.book,
    isLoading: bookQuery.isLoading && !readerOfflineSource.book,
    hasError: bookQuery.isError && !readerOfflineSource.book,
    ocrStatus: ocrStatusQuery.data,
    ocrScore: textLayerQualityQuery.data?.score ?? ocrStatusQuery.data?.score ?? null,
    fileUrl: readerOfflineSource.fileUrl,
    onStatusChange: readerActions.onStatusChange,
    onTriggerOcr: readerActions.onTriggerOcr,
    isTriggeringOcr: readerActions.isTriggeringOcr,
  };
};
