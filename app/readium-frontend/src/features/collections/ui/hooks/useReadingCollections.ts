import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import type { SaveReadingCollectionCommand } from '../../domain/ports/ReadingCollectionRepository';
import type {
  MoveReadingCollectionAction,
  UpdateReadingCollectionAction,
} from '../../domain/collection-actions';
import { getReadingCollectionUseCases } from '../../application/use-cases/reading-collection-use-case-factory';

export const useReadingCollections = (query = '') => {
  const useCases = getReadingCollectionUseCases();
  const queryClient = useQueryClient();

  const collectionsQuery = useQuery({
    queryKey: queryKeys.readingCollectionsList(query),
    queryFn: () => useCases.listReadingCollectionsUseCase.execute(query),
  });

  const createMutation = useMutation({
    mutationFn: (command: SaveReadingCollectionCommand) => useCases.createReadingCollectionUseCase.execute(command),
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
    mutationFn: ({ collectionId, command }: UpdateReadingCollectionAction) =>
      useCases.updateReadingCollectionUseCase.execute(collectionId, command),
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
    mutationFn: (collectionId: number) => useCases.deleteReadingCollectionUseCase.execute(collectionId),
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

  const moveMutation = useMutation({
    mutationFn: ({ collectionId, targetIndex }: MoveReadingCollectionAction) =>
      useCases.moveReadingCollectionUseCase.execute(collectionId, targetIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readingCollectionsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
    },
    onError: () => {
      toast.error('Erro ao reordenar colecao.');
    },
  });

  return {
    collections: [...(collectionsQuery.data ?? [])].sort(
      (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
    ),
    isLoading: collectionsQuery.isLoading,
    isError: collectionsQuery.isError,
    createCollection: createMutation.mutateAsync,
    updateCollection: updateMutation.mutateAsync,
    moveCollection: moveMutation.mutateAsync,
    deleteCollection: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending || moveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
