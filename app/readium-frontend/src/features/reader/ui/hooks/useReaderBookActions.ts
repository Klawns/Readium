import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Book, BookStatus } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import {
  triggerReaderOcrUseCase,
  updateReaderBookStatusUseCase,
} from '../../application/use-cases/reader-book-use-case-factory';

interface UseReaderBookActionsParams {
  bookId: number;
}

export const useReaderBookActions = ({ bookId }: UseReaderBookActionsParams) => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: (status: BookStatus) => updateReaderBookStatusUseCase.execute(bookId, status),
    onSuccess: (_, status) => {
      queryClient.setQueryData<Book | undefined>(queryKeys.book(bookId), (cachedBook) => {
        if (!cachedBook) {
          return cachedBook;
        }
        return {
          ...cachedBook,
          status,
        };
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.book(bookId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
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
    onError: (error: unknown) => {
      if (error instanceof Error && error.message.trim()) {
        toast.error(error.message);
        return;
      }
      toast.error('Erro ao iniciar OCR.');
    },
  });

  return {
    onStatusChange: updateStatusMutation.mutate,
    onTriggerOcr: () => triggerOcrMutation.mutate(),
    isTriggeringOcr: triggerOcrMutation.isPending,
  };
};
