import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { BookStatus, StatusFilter } from '@/types';
import { toast } from 'sonner';
import { createLogger } from '@/lib/logger.ts';
import { queryKeys } from '@/lib/query-keys';
import { BookHttpRepository } from '../infrastructure/api/book-http-repository';
import {
  FetchLibraryBooksUseCase,
  UpdateLibraryBookStatusUseCase,
  UploadLibraryBookUseCase,
} from '../application/use-cases/library-use-cases';
import { updateLibraryCachesAfterUpload } from '../application/services/library-cache-updater';
import { LIBRARY_PAGE_SIZE } from '../domain/library.constants';

const logger = createLogger('library');

const repository = new BookHttpRepository();
const fetchLibraryBooksUseCase = new FetchLibraryBooksUseCase(repository);
const uploadLibraryBookUseCase = new UploadLibraryBookUseCase(repository);
const updateLibraryBookStatusUseCase = new UpdateLibraryBookStatusUseCase(repository);

interface UseLibraryParams {
  page: number;
  statusFilter: StatusFilter;
  searchQuery: string;
}

export const useLibrary = ({ page, statusFilter, searchQuery }: UseLibraryParams) => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const booksQuery = useQuery({
    queryKey: queryKeys.books(statusFilter, page, searchQuery),
    queryFn: () => fetchLibraryBooksUseCase.execute(statusFilter, page, LIBRARY_PAGE_SIZE, searchQuery),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      setUploadProgress(0);
      return uploadLibraryBookUseCase.execute(file, {
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
    },
    onError: (error) => {
      setUploadProgress(null);
      logger.error('upload failed', error);
      toast.error('Erro ao fazer upload do livro.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookStatus }) =>
      updateLibraryBookStatusUseCase.execute(id, status),
    onSuccess: () => {
      toast.success('Status atualizado!');
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
    },
    onError: () => {
      toast.error('Erro ao atualizar status.');
    },
  });

  return {
    books: booksQuery.data?.content || [],
    totalPages: booksQuery.data?.totalPages || 0,
    totalElements: booksQuery.data?.totalElements || 0,
    isLoading: booksQuery.isLoading,
    isError: booksQuery.isError,
    uploadBook: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    updateStatus: (id: number, status: BookStatus) => updateStatusMutation.mutate({ id, status }),
  };
};
