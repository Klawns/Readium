import { useEffect, useMemo, useState } from 'react';
import type { Book, ReadingCollection } from '@/types';

export type CollectionExplorerFilter = 'all' | 'unassigned' | number;

interface UseCollectionExplorerStateParams {
  books: Book[];
  collections: ReadingCollection[];
  booksByCollectionId: Record<number, Book[]>;
  unassignedBooks: Book[];
}

export const useCollectionExplorerState = ({
  books,
  collections,
  booksByCollectionId,
  unassignedBooks,
}: UseCollectionExplorerStateParams) => {
  const [activeFilter, setActiveFilter] = useState<CollectionExplorerFilter>('all');

  useEffect(() => {
    if (typeof activeFilter !== 'number') {
      return;
    }
    if (collections.some((collection) => collection.id === activeFilter)) {
      return;
    }
    setActiveFilter('all');
  }, [activeFilter, collections]);

  const visibleBooks = useMemo(() => {
    if (activeFilter === 'all') {
      return books;
    }
    if (activeFilter === 'unassigned') {
      return unassignedBooks;
    }
    return booksByCollectionId[activeFilter] ?? [];
  }, [activeFilter, books, booksByCollectionId, unassignedBooks]);

  const activeCollection = useMemo(() => {
    if (typeof activeFilter !== 'number') {
      return null;
    }
    return collections.find((collection) => collection.id === activeFilter) ?? null;
  }, [activeFilter, collections]);

  const contentTitle = useMemo(() => {
    if (activeFilter === 'all') {
      return 'Todos os livros';
    }
    if (activeFilter === 'unassigned') {
      return 'Sem colecao';
    }
    return activeCollection?.name ?? 'Colecao';
  }, [activeCollection, activeFilter]);

  const contentSubtitle = useMemo(() => {
    if (activeFilter === 'all') {
      return 'Visao ampla para organizar toda a biblioteca.';
    }
    if (activeFilter === 'unassigned') {
      return 'Livros sem colecao vinculada.';
    }
    return 'Livros vinculados a esta colecao.';
  }, [activeFilter]);

  return {
    activeFilter,
    visibleBooks,
    activeCollection,
    contentTitle,
    contentSubtitle,
    setActiveFilter,
  };
};
