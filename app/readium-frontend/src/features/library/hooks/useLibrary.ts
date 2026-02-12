import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { BookStatus, StatusFilter } from '@/types';
import { toast } from 'sonner';
import { BookHttpRepository } from '../infrastructure/api/book-http-repository';
import {
  FetchLibraryBooksUseCase,
  UpdateLibraryBookStatusUseCase,
  UploadLibraryBookUseCase,
} from '../application/use-cases/library-use-cases';

const PAGE_SIZE = 12;

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

  const booksQuery = useQuery({
    queryKey: ['books', statusFilter, page, searchQuery],
    queryFn: () => fetchLibraryBooksUseCase.execute(statusFilter, page, PAGE_SIZE, searchQuery),
    placeholderData: keepPreviousData,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadLibraryBookUseCase.execute(file),
    onSuccess: () => {
      toast.success('Livro adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => {
      console.error(error);
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
    updateStatus: (id: number, status: BookStatus) => updateStatusMutation.mutate({ id, status }),
  };
};
