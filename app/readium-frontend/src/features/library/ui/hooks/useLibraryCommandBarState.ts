import { useMemo } from 'react';
import type { Category, ReadingCollection, StatusFilter } from '@/types';
import { BOOK_STATUS_LABEL } from '../../domain/status-metadata';
import { useCategoryHierarchy } from '@/features/classification/ui/hooks/useCategoryHierarchy';

interface UseLibraryCommandBarStateParams {
  categories: Category[];
  collections: ReadingCollection[];
  statusFilter: StatusFilter;
  selectedCategoryId: number | null;
  selectedCollectionId: number | null;
}

export interface ActiveLibraryFilter {
  id: 'status' | 'category' | 'collection';
  label: string;
}

export const useLibraryCommandBarState = ({
  categories,
  collections,
  statusFilter,
  selectedCategoryId,
  selectedCollectionId,
}: UseLibraryCommandBarStateParams) => {
  const { flattened } = useCategoryHierarchy(categories);

  const selectedCategory = useMemo(
    () => flattened.find((node) => node.category.id === selectedCategoryId)?.category ?? null,
    [flattened, selectedCategoryId],
  );

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === selectedCollectionId) ?? null,
    [collections, selectedCollectionId],
  );

  const activeFilters = useMemo<ActiveLibraryFilter[]>(() => {
    const filters: ActiveLibraryFilter[] = [];
    if (statusFilter !== 'ALL') {
      filters.push({ id: 'status', label: `Status: ${BOOK_STATUS_LABEL[statusFilter]}` });
    }
    if (selectedCategory) {
      filters.push({ id: 'category', label: `Categoria: ${selectedCategory.name}` });
    }
    if (selectedCollection) {
      filters.push({ id: 'collection', label: `Colecao: ${selectedCollection.name}` });
    }
    return filters;
  }, [selectedCategory, selectedCollection, statusFilter]);

  return {
    flattenedCategories: flattened,
    selectedCategory,
    selectedCollection,
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,
  };
};
