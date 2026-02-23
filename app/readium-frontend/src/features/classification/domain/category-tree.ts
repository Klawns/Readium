import type { Category } from '@/types';

export interface CategoryTreeNode {
  category: Category;
  depth: number;
  children: CategoryTreeNode[];
}
