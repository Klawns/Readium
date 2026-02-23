import type { Category } from '@/types';
import type { CategoryTreeNode } from '../../domain/category-tree';

const byOrderThenName = (left: Category, right: Category): number => {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }
  return left.name.localeCompare(right.name);
};

const createNode = (category: Category, depth: number): CategoryTreeNode => ({
  category,
  depth,
  children: [],
});

export const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
  const sorted = [...categories].sort(byOrderThenName);
  const byParent = new Map<number | null, Category[]>();

  for (const category of sorted) {
    const parentId = category.parentId ?? null;
    const group = byParent.get(parentId);
    if (group) {
      group.push(category);
    } else {
      byParent.set(parentId, [category]);
    }
  }

  const build = (parentId: number | null, depth: number): CategoryTreeNode[] => {
    const siblings = byParent.get(parentId) ?? [];
    return siblings.map((category) => ({
      ...createNode(category, depth),
      children: build(category.id, depth + 1),
    }));
  };

  return build(null, 0);
};

export const flattenCategoryTree = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
  const result: CategoryTreeNode[] = [];
  const walk = (nodeList: CategoryTreeNode[]) => {
    for (const node of nodeList) {
      result.push(node);
      walk(node.children);
    }
  };
  walk(nodes);
  return result;
};

export const collectDescendantIds = (categories: Category[], categoryId: number): number[] => {
  const byParent = new Map<number | null, number[]>();
  for (const category of categories) {
    const parentId = category.parentId ?? null;
    const ids = byParent.get(parentId);
    if (ids) {
      ids.push(category.id);
    } else {
      byParent.set(parentId, [category.id]);
    }
  }

  const result: number[] = [];
  const stack: number[] = [categoryId];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current == null || result.includes(current)) {
      continue;
    }
    result.push(current);
    const children = byParent.get(current) ?? [];
    for (const child of children) {
      stack.push(child);
    }
  }
  return result;
};
