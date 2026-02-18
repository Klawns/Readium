import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { Book, BookPage, BookStatus, StatusFilter } from '@/types';
import { toast } from 'sonner';
import { createLogger } from '@/lib/logger.ts';
import { BookHttpRepository } from '../infrastructure/api/book-http-repository';
import {
  FetchLibraryBooksUseCase,
  UpdateLibraryBookStatusUseCase,
  UploadLibraryBookUseCase,
} from '../application/use-cases/library-use-cases';

const PAGE_SIZE = 12;
const logger = createLogger('library');

const repository = new BookHttpRepository();
const fetchLibraryBooksUseCase = new FetchLibraryBooksUseCase(repository);
const uploadLibraryBookUseCase = new UploadLibraryBookUseCase(repository);
const updateLibraryBookStatusUseCase = new UpdateLibraryBookStatusUseCase(repository);

const normalizeText = (value: string | null | undefined): string => (value ?? '').trim().toLowerCase();

const matchesBookFilters = (book: Book, statusFilter: StatusFilter, searchQuery: string): boolean => {
  const statusMatches = statusFilter === 'ALL' || book.status === statusFilter;
  if (!statusMatches) {
    return false;
  }

  const normalizedSearch = normalizeText(searchQuery);
  if (!normalizedSearch) {
    return true;
  }

  const searchable = `${book.title} ${book.author ?? ''}`.toLowerCase();
  return searchable.includes(normalizedSearch);
};

const insertBookIntoPage = (page: BookPage, book: Book): BookPage => {
  if (page.content.some((item) => item.id === book.id)) {
    return page;
  }

  const pageSize = page.size > 0 ? page.size : PAGE_SIZE;
  const nextTotalElements = page.totalElements + 1;
  const nextTotalPages = Math.max(1, Math.ceil(nextTotalElements / pageSize));
  const shouldInsertIntoContent = page.number === 0;
  const nextContent = shouldInsertIntoContent ? [book, ...page.content].slice(0, pageSize) : page.content;

  return {
    ...page,
    content: nextContent,
    totalElements: nextTotalElements,
    totalPages: nextTotalPages,
    empty: nextContent.length === 0,
    first: page.number === 0,
    last: page.number >= nextTotalPages - 1,
  };
};

interface UseLibraryParams {
  page: number;
  statusFilter: StatusFilter;
  searchQuery: string;
}

export const useLibrary = ({ page, statusFilter, searchQuery }: UseLibraryParams) => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const booksQuery = useQuery({
    queryKey: ['books', statusFilter, page, searchQuery],
    queryFn: () => fetchLibraryBooksUseCase.execute(statusFilter, page, PAGE_SIZE, searchQuery),
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
      const bookQueries = queryClient.getQueryCache().findAll({ queryKey: ['books'] });
      for (const query of bookQueries) {
        const queryKey = query.queryKey;
        if (!Array.isArray(queryKey) || queryKey.length < 4) {
          continue;
        }

        const cachedStatus = queryKey[1];
        const cachedSearch = queryKey[3];
        if (typeof cachedStatus !== 'string' || typeof cachedSearch !== 'string') {
          continue;
        }

        if (!matchesBookFilters(createdBook, cachedStatus as StatusFilter, cachedSearch)) {
          continue;
        }

        queryClient.setQueryData<BookPage>(queryKey, (current) => {
          if (!current) {
            return current;
          }
          return insertBookIntoPage(current, createdBook);
        });
      }

      setUploadProgress(100);
      toast.success('Livro adicionado com sucesso!');
      window.setTimeout(() => {
        setUploadProgress(null);
      }, 450);
      queryClient.invalidateQueries({ queryKey: ['books'], refetchType: 'inactive' });
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
      queryClient.invalidateQueries({ queryKey: ['books'] });
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
