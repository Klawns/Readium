import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { BookStatus } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import {
  getReaderBookFileUrlUseCase,
  getReaderBookUseCase,
  getReaderOcrStatusUseCase,
  getReaderTextLayerQualityUseCase,
  triggerReaderOcrUseCase,
  updateReaderBookStatusUseCase,
} from '../../application/use-cases/reader-book-use-case-factory';

const OCR_POLLING_INTERVAL_MS = 2000;

export const useReaderBook = (bookId: number) => {
  const queryClient = useQueryClient();
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

  const updateStatusMutation = useMutation({
    mutationFn: (status: BookStatus) => updateReaderBookStatusUseCase.execute(bookId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.book(bookId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      toast.success('Status atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status.');
    },
  });

  const triggerOcrMutation = useMutation({
    mutationFn: () => triggerReaderOcrUseCase.execute(bookId),
    onSuccess: () => {
      toast.success('OCR iniciado.');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookOcrStatus(bookId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookTextLayerQuality(bookId) });
    },
    onError: () => {
      toast.error('Erro ao iniciar OCR.');
    },
  });

  const fileVersion = ocrStatusQuery.data?.updatedAt ?? null;

  return {
    book: bookQuery.data,
    isLoading: bookQuery.isLoading,
    hasError: bookQuery.isError,
    ocrStatus: ocrStatusQuery.data,
    ocrScore: textLayerQualityQuery.data?.score ?? ocrStatusQuery.data?.score ?? null,
    fileUrl: getReaderBookFileUrlUseCase.execute(bookId, fileVersion),
    onStatusChange: updateStatusMutation.mutate,
    onTriggerOcr: () => triggerOcrMutation.mutate(),
    isTriggeringOcr: triggerOcrMutation.isPending,
  };
};
