import { useMemo, useState } from 'react';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Book, ReadingCollection } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import {
  listBookCollectionsUseCase,
  setBookCollectionsUseCase,
} from '../../application/use-cases/reading-collection-use-case-factory';

type DropTarget = number | 'unassigned' | null;

interface UseCollectionFolderBoardParams {
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

export const useCollectionFolderBoard = ({
  books,
  collections,
}: UseCollectionFolderBoardParams) => {
  const queryClient = useQueryClient();
  const [draggingBookId, setDraggingBookId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  const bookCollectionQueries = useQueries({
    queries: books.map((book) => ({
      queryKey: queryKeys.bookCollections(book.id),
      queryFn: () => listBookCollectionsUseCase.execute(book.id),
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
        bookCollectionsById[bookId] ?? (await listBookCollectionsUseCase.execute(bookId));
      const currentIds = currentCollections.map((collection) => collection.id).sort((a, b) => a - b);

      const nextIds =
        targetCollectionId == null
          ? []
          : Array.from(new Set([...currentIds, targetCollectionId])).sort((a, b) => a - b);

      if (areSameIds(currentIds, nextIds)) {
        return { bookId, collections: currentCollections, changed: false };
      }

      const savedCollections = await setBookCollectionsUseCase.execute(bookId, nextIds);
      return { bookId, collections: savedCollections, changed: true };
    },
    onSuccess: ({ bookId, collections, changed }) => {
      queryClient.setQueryData(queryKeys.bookCollections(bookId), collections);
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

  const isCollectionsLoading = bookCollectionQueries.some((query) => query.isLoading);
  const isDragging = draggingBookId != null;

  const applyTargetToBook = async (bookId: number, target: DropTarget) => {
    if (updateBookCollectionsMutation.isPending) {
      return;
    }
    const targetCollectionId = target === 'unassigned' ? null : target;
    if (targetCollectionId == null) {
      await updateBookCollectionsMutation.mutateAsync({
        bookId,
        targetCollectionId: null,
      });
      return;
    }
    await updateBookCollectionsMutation.mutateAsync({
      bookId,
      targetCollectionId,
    });
  };

  const startDragging = (bookId: number) => setDraggingBookId(bookId);
  const stopDragging = () => {
    setDraggingBookId(null);
    setDropTarget(null);
  };

  const highlightTarget = (target: DropTarget) => setDropTarget(target);
  const clearTarget = () => setDropTarget(null);

  const dropIntoCollection = async (collectionId: number) => {
    if (draggingBookId == null) {
      return;
    }
    await applyTargetToBook(draggingBookId, collectionId);
    stopDragging();
  };

  const dropIntoUnassigned = async () => {
    if (draggingBookId == null) {
      return;
    }
    await applyTargetToBook(draggingBookId, 'unassigned');
    stopDragging();
  };

  return {
    bookCollectionsById,
    booksByCollectionId,
    unassignedBooks,
    isCollectionsLoading,
    isSavingDrop: updateBookCollectionsMutation.isPending,
    draggingBookId,
    isDragging,
    dropTarget,
    startDragging,
    stopDragging,
    highlightTarget,
    clearTarget,
    dropIntoCollection,
    dropIntoUnassigned,
    moveBookToTarget: applyTargetToBook,
  };
};
