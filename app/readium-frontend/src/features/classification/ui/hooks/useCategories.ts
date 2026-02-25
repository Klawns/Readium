import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import type { MoveCategoryCommand } from '../../domain/category-actions';
import type { SaveCategoryCommand } from '../../domain/ports/CategoryRepository';
import { getCategoryUseCases } from '../../application/use-cases/category-use-case-factory';

export const useCategories = (query = '') => {
  const useCases = getCategoryUseCases();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categoriesList(query),
    queryFn: () => useCases.listCategoriesUseCase.execute(query),
  });

  const createMutation = useMutation({
    mutationFn: (payload: SaveCategoryCommand) => useCases.createCategoryUseCase.execute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
      toast.success('Categoria criada.');
    },
    onError: () => {
      toast.error('Erro ao criar categoria.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: number; payload: SaveCategoryCommand }) =>
      useCases.updateCategoryUseCase.execute(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
      toast.success('Categoria atualizada.');
    },
    onError: () => {
      toast.error('Erro ao atualizar categoria.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) => useCases.deleteCategoryUseCase.execute(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
      toast.success('Categoria removida.');
    },
    onError: () => {
      toast.error('Erro ao remover categoria.');
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ categoryId, parentId }: MoveCategoryCommand) =>
      useCases.moveCategoryUseCase.execute(categoryId, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
    },
    onError: () => {
      toast.error('Erro ao mover categoria.');
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    moveCategory: moveMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending || moveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
