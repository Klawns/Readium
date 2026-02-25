import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { BookStatus, StatusFilter } from '@/types';
import { toast } from 'sonner';
import { createLogger } from '@/lib/logger.ts';
import { queryKeys } from '@/lib/query-keys';
import type { LibraryUseCases } from '../application/use-cases/library-use-cases';
import { updateLibraryCachesAfterUpload } from '../application/services/library-cache-updater';
import { LIBRARY_PAGE_SIZE } from '../domain/library.constants';
import { getLibraryUseCases } from '../infrastructure/library-use-cases';
import { upsertOfflineBookSnapshots } from '@/features/offline/application/services/offline-book-snapshot-service';
import { useLibraryOfflineFallback } from './useLibraryOfflineFallback';
import { isLocalConnectionMode } from '@/features/preferences/application/services/connection-mode-service.ts';

const logger = createLogger('library');

interface UseLibraryParams {
  page: number;
  statusFilter: StatusFilter;
  searchQuery: string;
  categoryId: number | null;
  collectionId: number | null;
}

export const useLibrary = (
  { page, statusFilter, searchQuery, categoryId, collectionId }: UseLibraryParams,
  useCases?: LibraryUseCases,
) => {
  const resolveUseCases = (): LibraryUseCases => useCases ?? getLibraryUseCases();
  const isLocalMode = isLocalConnectionMode();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const booksQuery = useQuery({
    queryKey: queryKeys.books(statusFilter, page, searchQuery, categoryId, collectionId),
    queryFn: () =>
      resolveUseCases().fetchBooks(
        statusFilter,
        page,
        LIBRARY_PAGE_SIZE,
        searchQuery,
        categoryId,
        collectionId,
      ),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const offlineFallback = useLibraryOfflineFallback({
    enabled: !isLocalMode && booksQuery.isError,
  });

  const isUsingOfflineFallback = offlineFallback.isUsingOfflineFallback;

  useEffect(() => {
    const books = booksQuery.data?.content ?? [];
    if (books.length === 0) {
      return;
    }
    void upsertOfflineBookSnapshots(books);
  }, [booksQuery.data]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      setUploadProgress(0);
      return resolveUseCases().uploadBook(file, {
        onProgress: (progressPercent) => setUploadProgress(progressPercent),
      });
    },
    onSuccess: (createdBook) => {
      updateLibraryCachesAfterUpload(queryClient, createdBook);

      setUploadProgress(100);
      toast.success('Livro adicionado com sucesso!');
      window.setTimeout(() => {
        setUploadProgress(null);
      }, 450);
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot(), refetchType: 'inactive' });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot(), refetchType: 'inactive' });
    },
    onError: (error) => {
      setUploadProgress(null);
      logger.error('upload failed', error);
      if (error instanceof Error && error.message) {
        toast.error(error.message);
        return;
      }
      toast.error('Erro ao fazer upload do livro.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookStatus }) =>
      resolveUseCases().updateBookStatus(id, status),
    onSuccess: () => {
      toast.success('Status atualizado!');
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
    },
    onError: () => {
      toast.error('Erro ao atualizar status.');
    },
  });

  return {
    books: isUsingOfflineFallback ? offlineFallback.books : (booksQuery.data?.content || []),
    totalPages: isUsingOfflineFallback ? 1 : (booksQuery.data?.totalPages || 0),
    totalElements: isUsingOfflineFallback ? offlineFallback.books.length : (booksQuery.data?.totalElements || 0),
    isLoading: booksQuery.isLoading || (booksQuery.isError && offlineFallback.isLoading),
    isError: booksQuery.isError && !isUsingOfflineFallback && !offlineFallback.isLoading,
    isOfflineFallback: isLocalMode || isUsingOfflineFallback,
    uploadBook: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    updateStatus: (id: number, status: BookStatus) => updateStatusMutation.mutate({ id, status }),
  };
};
