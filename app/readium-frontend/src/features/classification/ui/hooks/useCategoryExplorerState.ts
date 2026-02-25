import { useEffect, useMemo, useState } from 'react';
import type { Category } from '@/types';
import { useCategoryHierarchy } from './useCategoryHierarchy';

export type CategoryExplorerFilter = 'all' | number;

interface UseCategoryExplorerStateParams {
  categories: Category[];
}

export const useCategoryExplorerState = ({ categories }: UseCategoryExplorerStateParams) => {
  const [activeFilter, setActiveFilter] = useState<CategoryExplorerFilter>('all');
  const { tree, getDescendantIds } = useCategoryHierarchy(categories);

  useEffect(() => {
    if (typeof activeFilter !== 'number') {
      return;
    }
    if (categories.some((category) => category.id === activeFilter)) {
      return;
    }
    setActiveFilter('all');
  }, [activeFilter, categories]);

  const rootCategories = useMemo(() => tree.map((node) => node.category), [tree]);

  const descendantCountById = useMemo(() => {
    const result: Record<number, number> = {};
    for (const category of categories) {
      result[category.id] = getDescendantIds(category.id).length;
    }
    return result;
  }, [categories, getDescendantIds]);

  const visibleCategories = useMemo(() => {
    if (activeFilter === 'all') {
      return categories;
    }
    const visibleIds = new Set(getDescendantIds(activeFilter));
    return categories.filter((category) => visibleIds.has(category.id));
  }, [activeFilter, categories, getDescendantIds]);

  const activeCategory = useMemo(() => {
    if (typeof activeFilter !== 'number') {
      return null;
    }
    return categories.find((category) => category.id === activeFilter) ?? null;
  }, [activeFilter, categories]);

  const contentTitle = useMemo(() => {
    if (activeFilter === 'all') {
      return 'Todas as categorias';
    }
    return activeCategory?.name ?? 'Categoria';
  }, [activeCategory, activeFilter]);

  const contentSubtitle = useMemo(() => {
    if (activeFilter === 'all') {
      return 'Gerencie toda a hierarquia da biblioteca em um so lugar.';
    }
    return 'Gerencie o ramo selecionado e seus descendentes.';
  }, [activeFilter]);

  return {
    activeFilter,
    rootCategories,
    descendantCountById,
    visibleCategories,
    contentTitle,
    contentSubtitle,
    setActiveFilter,
  };
};
