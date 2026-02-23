import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  listBookCategoriesUseCase,
  setBookCategoriesUseCase,
} from '../../application/use-cases/category-use-case-factory';

export const useBookCategories = (bookId: number | null) => {
  const queryClient = useQueryClient();
  const enabled = typeof bookId === 'number' && Number.isFinite(bookId) && bookId > 0;

  const bookCategoriesQuery = useQuery({
    queryKey: queryKeys.bookCategories(bookId ?? -1),
    queryFn: () => listBookCategoriesUseCase.execute(bookId as number),
    enabled,
  });

  const setBookCategoriesMutation = useMutation({
    mutationFn: (categoryIds: number[]) => setBookCategoriesUseCase.execute(bookId as number, categoryIds),
    onSuccess: (categories) => {
      if (!enabled || bookId == null) {
        return;
      }
      queryClient.setQueryData(queryKeys.bookCategories(bookId), categories);
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
      toast.success('Categorias do livro atualizadas.');
    },
    onError: () => {
      toast.error('Erro ao atualizar categorias do livro.');
    },
  });

  return {
    bookCategories: bookCategoriesQuery.data ?? [],
    isLoading: bookCategoriesQuery.isLoading,
    isError: bookCategoriesQuery.isError,
    setBookCategories: setBookCategoriesMutation.mutateAsync,
    isSaving: setBookCategoriesMutation.isPending,
  };
};
