import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  listBookCollectionsUseCase,
  setBookCollectionsUseCase,
} from '../../application/use-cases/reading-collection-use-case-factory';

export const useBookCollections = (bookId: number | null) => {
  const queryClient = useQueryClient();
  const enabled = typeof bookId === 'number' && Number.isFinite(bookId) && bookId > 0;

  const bookCollectionsQuery = useQuery({
    queryKey: queryKeys.bookCollections(bookId ?? -1),
    queryFn: () => listBookCollectionsUseCase.execute(bookId as number),
    enabled,
  });

  const setBookCollectionsMutation = useMutation({
    mutationFn: (collectionIds: number[]) => setBookCollectionsUseCase.execute(bookId as number, collectionIds),
    onSuccess: (collections) => {
      if (!enabled || bookId == null) {
        return;
      }
      queryClient.setQueryData(queryKeys.bookCollections(bookId), collections);
      queryClient.invalidateQueries({ queryKey: queryKeys.readingCollectionsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
      toast.success('Colecoes do livro atualizadas.');
    },
    onError: () => {
      toast.error('Erro ao atualizar colecoes do livro.');
    },
  });

  return {
    bookCollections: bookCollectionsQuery.data ?? [],
    isLoading: bookCollectionsQuery.isLoading,
    isError: bookCollectionsQuery.isError,
    setBookCollections: setBookCollectionsMutation.mutateAsync,
    isSaving: setBookCollectionsMutation.isPending,
  };
};

