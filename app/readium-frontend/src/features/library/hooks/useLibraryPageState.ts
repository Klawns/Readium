import { useEffect, useState } from 'react';
import type { Book, Category, ReadingCollection, StatusFilter } from '@/types';

type UpdateLibraryParamsInput = {
  status?: StatusFilter;
  page?: number;
  query?: string;
  categoryId?: number | null;
  collectionId?: number | null;
};

type UpdateLibraryParams = (next: UpdateLibraryParamsInput) => void;

interface UseLibraryPageStateParams {
  searchQuery: string;
  categoryId: number | null;
  collectionId: number | null;
  categories: Category[];
  collections: ReadingCollection[];
  updateParams: UpdateLibraryParams;
}

export const useLibraryPageState = ({
  searchQuery,
  categoryId,
  collectionId,
  categories,
  collections,
  updateParams,
}: UseLibraryPageStateParams) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [selectedBookForCategories, setSelectedBookForCategories] = useState<Book | null>(null);
  const [selectedBookForCollections, setSelectedBookForCollections] = useState<Book | null>(null);
  const [collectionBooksQuery, setCollectionBooksQuery] = useState('');

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalized = localSearch.trim();
      if (normalized !== searchQuery) {
        updateParams({ query: normalized, page: 0 });
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [localSearch, searchQuery, updateParams]);

  useEffect(() => {
    if (categoryId == null) {
      return;
    }
    if (categories.some((category) => category.id === categoryId)) {
      return;
    }
    updateParams({ categoryId: null, page: 0 });
  }, [categories, categoryId, updateParams]);

  useEffect(() => {
    if (collectionId == null) {
      return;
    }
    if (collections.some((collection) => collection.id === collectionId)) {
      return;
    }
    updateParams({ collectionId: null, page: 0 });
  }, [collections, collectionId, updateParams]);

  const onCollectionsOpenChange = (open: boolean) => {
    setCollectionsOpen(open);
    if (!open) {
      setCollectionBooksQuery('');
    }
  };

  return {
    uploadOpen,
    localSearch,
    collectionsOpen,
    selectedBookForCategories,
    selectedBookForCollections,
    collectionBooksQuery,
    setLocalSearch,
    setCollectionBooksQuery,
    openUploadModal: () => setUploadOpen(true),
    closeUploadModal: () => setUploadOpen(false),
    openCollectionsManager: () => setCollectionsOpen(true),
    onCollectionsOpenChange,
    openCategoryDialog: (book: Book) => setSelectedBookForCategories(book),
    closeCategoryDialog: () => setSelectedBookForCategories(null),
    openCollectionDialog: (book: Book) => setSelectedBookForCollections(book),
    closeCollectionDialog: () => setSelectedBookForCollections(null),
  };
};
