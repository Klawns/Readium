import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  createCategoryUseCase,
  deleteCategoryUseCase,
  listCategoriesUseCase,
  moveCategoryUseCase,
  updateCategoryUseCase,
} from '../../application/use-cases/category-use-case-factory';

interface SaveCategoryPayload {
  name: string;
  color?: string;
  parentId?: number | null;
}

export const useCategories = (query = '') => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categoriesList(query),
    queryFn: () => listCategoriesUseCase.execute(query),
  });

  const createMutation = useMutation({
    mutationFn: (payload: SaveCategoryPayload) => createCategoryUseCase.execute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      toast.success('Categoria criada.');
    },
    onError: () => {
      toast.error('Erro ao criar categoria.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: number; payload: SaveCategoryPayload }) =>
      updateCategoryUseCase.execute(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      toast.success('Categoria atualizada.');
    },
    onError: () => {
      toast.error('Erro ao atualizar categoria.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) => deleteCategoryUseCase.execute(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      toast.success('Categoria removida.');
    },
    onError: () => {
      toast.error('Erro ao remover categoria.');
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ categoryId, parentId }: { categoryId: number; parentId: number | null }) =>
      moveCategoryUseCase.execute(categoryId, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
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
