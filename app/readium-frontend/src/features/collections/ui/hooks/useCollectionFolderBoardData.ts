import { useMemo } from 'react';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Book, ReadingCollection } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import type { BookCollectionDropTarget } from '../../domain/collection-actions';
import { getReadingCollectionUseCases } from '../../application/use-cases/reading-collection-use-case-factory';

interface UseCollectionFolderBoardDataParams {
  books: Book[];
  collections: ReadingCollection[];
}

interface UpdateBookCollectionsInput {
  bookId: number;
  targetCollectionId: number | null;
}

interface UpdateBookCollectionsResult {
  bookId: number;
  collections: ReadingCollection[];
  changed: boolean;
}

const areSameIds = (left: number[], right: number[]) =>
  left.length === right.length && left.every((id, index) => id === right[index]);

export const useCollectionFolderBoardData = ({
  books,
  collections,
}: UseCollectionFolderBoardDataParams) => {
  const useCases = getReadingCollectionUseCases();
  const queryClient = useQueryClient();

  const bookCollectionQueries = useQueries({
    queries: books.map((book) => ({
      queryKey: queryKeys.bookCollections(book.id),
      queryFn: () => useCases.listBookCollectionsUseCase.execute(book.id),
      staleTime: 30_000,
    })),
  });

  const bookCollectionsById = useMemo(() => {
    const map: Record<number, ReadingCollection[]> = {};
    books.forEach((book, index) => {
      map[book.id] = bookCollectionQueries[index]?.data ?? [];
    });
    return map;
  }, [books, bookCollectionQueries]);

  const booksByCollectionId = useMemo(() => {
    const map: Record<number, Book[]> = {};
    collections.forEach((collection) => {
      map[collection.id] = [];
    });

    books.forEach((book) => {
      const assigned = bookCollectionsById[book.id] ?? [];
      assigned.forEach((collection) => {
        if (!map[collection.id]) {
          map[collection.id] = [];
        }
        map[collection.id].push(book);
      });
    });

    return map;
  }, [books, collections, bookCollectionsById]);

  const unassignedBooks = useMemo(
    () => books.filter((book) => (bookCollectionsById[book.id] ?? []).length === 0),
    [books, bookCollectionsById],
  );

  const updateBookCollectionsMutation = useMutation({
    mutationFn: async ({
      bookId,
      targetCollectionId,
    }: UpdateBookCollectionsInput): Promise<UpdateBookCollectionsResult> => {
      const currentCollections =
        bookCollectionsById[bookId] ?? (await useCases.listBookCollectionsUseCase.execute(bookId));
      const currentIds = currentCollections.map((collection) => collection.id).sort((a, b) => a - b);

      const nextIds =
        targetCollectionId == null
          ? []
          : Array.from(new Set([...currentIds, targetCollectionId])).sort((a, b) => a - b);

      if (areSameIds(currentIds, nextIds)) {
        return { bookId, collections: currentCollections, changed: false };
      }

      const savedCollections = await useCases.setBookCollectionsUseCase.execute(bookId, nextIds);
      return { bookId, collections: savedCollections, changed: true };
    },
    onSuccess: ({ bookId, collections: savedCollections, changed }) => {
      queryClient.setQueryData(queryKeys.bookCollections(bookId), savedCollections);
      if (!changed) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.readingCollectionsRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() });
    },
    onError: () => {
      toast.error('Erro ao mover livro entre colecoes.');
    },
  });

  const moveBookToTarget = async (bookId: number, target: BookCollectionDropTarget) => {
    if (updateBookCollectionsMutation.isPending) {
      return;
    }
    const targetCollectionId = target === 'unassigned' ? null : target;
    await updateBookCollectionsMutation.mutateAsync({
      bookId,
      targetCollectionId,
    });
  };

  return {
    bookCollectionsById,
    booksByCollectionId,
    unassignedBooks,
    isCollectionsLoading: bookCollectionQueries.some((query) => query.isLoading),
    isSavingDrop: updateBookCollectionsMutation.isPending,
    moveBookToTarget,
  };
};
