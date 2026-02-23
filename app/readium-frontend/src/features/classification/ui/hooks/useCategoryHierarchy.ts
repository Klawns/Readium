import { useMemo } from 'react';
import type { Category } from '@/types';
import {
  buildCategoryTree,
  collectDescendantIds,
  flattenCategoryTree,
} from '../../application/services/category-tree-builder';

export const useCategoryHierarchy = (categories: Category[]) => {
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flattened = useMemo(() => flattenCategoryTree(tree), [tree]);

  const getDescendantIds = (categoryId: number) => collectDescendantIds(categories, categoryId);

  return {
    tree,
    flattened,
    getDescendantIds,
  };
};
