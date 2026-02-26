import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Book } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import type { OfflineDownloadUseCases } from '../../application/use-cases/offline-download-use-cases';
import type { OfflineBookDownload } from '../../domain/offline-book';

const invalidateOfflineQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  bookId?: number,
) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.offlineDownloadsRoot() });
  queryClient.invalidateQueries({ queryKey: queryKeys.offlineLibraryBooks() });
  if (typeof bookId === 'number' && Number.isFinite(bookId) && bookId > 0) {
    queryClient.invalidateQueries({ queryKey: queryKeys.readerAnnotationsRoot(bookId) });
  }
};

const getErrorMessage = (error: unknown, fallback: string): string => (
  error instanceof Error && error.message ? error.message : fallback
);

interface UseOfflineDownloadMutationsResult {
  downloadBook: (book: Book) => Promise<OfflineBookDownload | null>;
  removeDownload: (bookId: number) => Promise<void>;
  isDownloadingBookId: number | null;
  downloadingBookProgressPercent: number | null;
  isRemovingBookId: number | null;
}

export const useOfflineDownloadMutations = (
  useCases: OfflineDownloadUseCases,
): UseOfflineDownloadMutationsResult => {
  const queryClient = useQueryClient();
  const [activeDownloadProgress, setActiveDownloadProgress] = useState<{
    bookId: number;
    progressPercent: number | null;
  } | null>(null);

  const downloadMutation = useMutation({
    mutationFn: (book: Book) => {
      setActiveDownloadProgress({
        bookId: book.id,
        progressPercent: null,
      });

      return useCases.saveDownload(book, {
        onProgressPercent: (progressPercent) => {
          setActiveDownloadProgress((current) => {
            if (!current || current.bookId !== book.id) {
              return current;
            }
            return {
              bookId: book.id,
              progressPercent,
            };
          });
        },
      });
    },
    onSuccess: (record) => {
      queryClient.setQueryData(queryKeys.offlineDownload(record.bookId), record);
      invalidateOfflineQueries(queryClient, record.bookId);
      toast.success('Livro salvo para leitura offline.');
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Falha ao salvar livro offline.');
      toast.error(message);
    },
    onSettled: (_, __, book) => {
      setActiveDownloadProgress((current) => {
        if (!current || current.bookId !== book.id) {
          return current;
        }
        return null;
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (bookId: number) => useCases.removeDownload(bookId),
    onSuccess: (_, bookId) => {
      queryClient.setQueryData(queryKeys.offlineDownload(bookId), null);
      invalidateOfflineQueries(queryClient, bookId);
      toast.success('Arquivo offline removido.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Falha ao remover arquivo offline.'));
    },
  });

  const downloadBook = async (book: Book) => {
    try {
      return await downloadMutation.mutateAsync(book);
    } catch {
      return null;
    }
  };

  const removeDownload = async (bookId: number) => {
    try {
      await removeMutation.mutateAsync(bookId);
    } catch {
      // Feedback ja enviado no onError da mutation.
    }
  };

  return {
    downloadBook,
    removeDownload,
    isDownloadingBookId: downloadMutation.isPending
      ? activeDownloadProgress?.bookId ?? downloadMutation.variables?.id ?? null
      : null,
    downloadingBookProgressPercent: downloadMutation.isPending
      ? activeDownloadProgress?.progressPercent ?? null
      : null,
    isRemovingBookId: removeMutation.isPending ? removeMutation.variables ?? null : null,
  };
};
