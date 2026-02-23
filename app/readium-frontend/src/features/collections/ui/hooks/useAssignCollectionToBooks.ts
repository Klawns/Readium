import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  listBookCollectionsUseCase,
  setBookCollectionsUseCase,
} from '../../application/use-cases/reading-collection-use-case-factory';

interface AssignCollectionToBooksInput {
  collectionId: number;
  bookIds: number[];
}

const sanitizeBookIds = (bookIds: number[]) =>
  Array.from(new Set(bookIds.filter((bookId) => Number.isFinite(bookId) && bookId > 0)));

export const useAssignCollectionToBooks = () => {
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async ({ collectionId, bookIds }: AssignCollectionToBooksInput) => {
      const targets = sanitizeBookIds(bookIds);
      await Promise.all(
        targets.map(async (bookId) => {
          const existing = await listBookCollectionsUseCase.execute(bookId);
          const nextIds = Array.from(new Set([...existing.map((collection) => collection.id), collectionId]));
          const saved = await setBookCollectionsUseCase.execute(bookId, nextIds);
          queryClient.setQueryData(queryKeys.bookCollections(bookId), saved);
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readingCollectionsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
    },
    onError: () => {
      toast.error('Colecao criada, mas houve erro ao vincular alguns livros.');
    },
  });

  return {
    assignCollectionToBooks: assignMutation.mutateAsync,
    isAssigningBooks: assignMutation.isPending,
  };
};
