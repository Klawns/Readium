import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  createReadingCollectionUseCase,
  deleteReadingCollectionUseCase,
  listReadingCollectionsUseCase,
  updateReadingCollectionUseCase,
} from '../../application/use-cases/reading-collection-use-case-factory';

interface SaveReadingCollectionPayload {
  name: string;
  description?: string | null;
  color?: string;
  icon?: string;
}

export const useReadingCollections = (query = '') => {
  const queryClient = useQueryClient();

  const collectionsQuery = useQuery({
    queryKey: queryKeys.readingCollectionsList(query),
    queryFn: () => listReadingCollectionsUseCase.execute(query),
  });

  const createMutation = useMutation({
    mutationFn: (payload: SaveReadingCollectionPayload) => createReadingCollectionUseCase.execute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readingCollectionsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
      toast.success('Colecao criada.');
    },
    onError: () => {
      toast.error('Erro ao criar colecao.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: number; payload: SaveReadingCollectionPayload }) =>
      updateReadingCollectionUseCase.execute(collectionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readingCollectionsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
      toast.success('Colecao atualizada.');
    },
    onError: () => {
      toast.error('Erro ao atualizar colecao.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (collectionId: number) => deleteReadingCollectionUseCase.execute(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readingCollectionsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
      toast.success('Colecao removida.');
    },
    onError: () => {
      toast.error('Erro ao remover colecao.');
    },
  });

  return {
    collections: collectionsQuery.data ?? [],
    isLoading: collectionsQuery.isLoading,
    isError: collectionsQuery.isError,
    createCollection: createMutation.mutateAsync,
    updateCollection: updateMutation.mutateAsync,
    deleteCollection: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

