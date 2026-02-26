import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
const UPLOAD_PROGRESS_RESET_DELAY_MS = 450;

interface UseLibraryParams {
  page: number;
  statusFilter: StatusFilter;
  searchQuery: string;
  categoryId: number | null;
  collectionId: number | null;
}

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export const useLibrary = (
  { page, statusFilter, searchQuery, categoryId, collectionId }: UseLibraryParams,
  useCases?: LibraryUseCases,
) => {
  const resolvedUseCases = useMemo<LibraryUseCases>(() => useCases ?? getLibraryUseCases(), [useCases]);
  const isLocalMode = isLocalConnectionMode();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const uploadProgressTimeoutRef = useRef<number | null>(null);

  const clearUploadProgressTimeout = useCallback(() => {
    if (uploadProgressTimeoutRef.current == null) {
      return;
    }

    window.clearTimeout(uploadProgressTimeoutRef.current);
    uploadProgressTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearUploadProgressTimeout();
    };
  }, [clearUploadProgressTimeout]);

  const invalidateBooksAndInsights = useCallback((refetchType: 'active' | 'inactive' = 'active') => {
    queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot(), refetchType });
    queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot(), refetchType });
  }, [queryClient]);

  const booksQuery = useQuery({
    queryKey: queryKeys.books(statusFilter, page, searchQuery, categoryId, collectionId),
    queryFn: () =>
      resolvedUseCases.fetchBooks(
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
  const booksFromApi = booksQuery.data?.content ?? [];

  useEffect(() => {
    if (booksFromApi.length === 0) {
      return;
    }

    void upsertOfflineBookSnapshots(booksFromApi);
  }, [booksFromApi]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      clearUploadProgressTimeout();
      setUploadProgress(0);
      return resolvedUseCases.uploadBook(file, {
        onProgress: (progressPercent) => setUploadProgress(progressPercent),
      });
    },
    onSuccess: (createdBook) => {
      updateLibraryCachesAfterUpload(queryClient, createdBook);
      setUploadProgress(100);
      toast.success('Livro adicionado com sucesso!');

      clearUploadProgressTimeout();
      uploadProgressTimeoutRef.current = window.setTimeout(() => {
        setUploadProgress(null);
        uploadProgressTimeoutRef.current = null;
      }, UPLOAD_PROGRESS_RESET_DELAY_MS);

      invalidateBooksAndInsights('inactive');
    },
    onError: (error) => {
      clearUploadProgressTimeout();
      setUploadProgress(null);
      logger.error('upload failed', error);
      toast.error(resolveErrorMessage(error, 'Erro ao fazer upload do livro.'));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookStatus }) =>
      resolvedUseCases.updateBookStatus(id, status),
    onSuccess: () => {
      toast.success('Status atualizado!');
      invalidateBooksAndInsights();
    },
    onError: () => {
      toast.error('Erro ao atualizar status.');
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (bookId: number) => resolvedUseCases.deleteBook(bookId),
    onSuccess: () => {
      toast.success('Livro removido com sucesso.');
      invalidateBooksAndInsights();
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot(), refetchType: 'inactive' });
      queryClient.invalidateQueries({ queryKey: queryKeys.readingCollectionsRoot(), refetchType: 'inactive' });
    },
    onError: (error: unknown) => {
      logger.error('delete book failed', error);
      toast.error(resolveErrorMessage(error, 'Erro ao remover livro.'));
    },
  });

  return {
    books: isUsingOfflineFallback ? offlineFallback.books : booksFromApi,
    totalPages: isUsingOfflineFallback ? 1 : (booksQuery.data?.totalPages ?? 0),
    totalElements: isUsingOfflineFallback ? offlineFallback.books.length : (booksQuery.data?.totalElements ?? 0),
    isLoading: booksQuery.isLoading || (booksQuery.isError && offlineFallback.isLoading),
    isError: booksQuery.isError && !isUsingOfflineFallback && !offlineFallback.isLoading,
    isOfflineFallback: isLocalMode || isUsingOfflineFallback,
    uploadBook: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    updateStatus: (id: number, status: BookStatus) => updateStatusMutation.mutate({ id, status }),
    deleteBook: (id: number) => deleteBookMutation.mutateAsync(id),
    deletingBookId: deleteBookMutation.isPending ? deleteBookMutation.variables ?? null : null,
  };
};
