import { GripVertical, Layers3 } from 'lucide-react';
import type { CategoryTreeNode } from '../domain/category-tree';
import type { CategoryTreeInteraction } from './category-management.types';
import { CategoryHierarchyTree } from './CategoryHierarchyTree';

interface CategoryHierarchySectionProps {
  tree: CategoryTreeNode[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  treeScrollClassName?: string;
  interaction: CategoryTreeInteraction;
}

export const CategoryHierarchySection = ({
  tree,
  isLoading,
  isSaving,
  isDeleting,
  treeScrollClassName,
  interaction,
}: CategoryHierarchySectionProps) => {
  const scrollClassName = ['min-h-0 flex-1 overflow-y-auto pr-1', treeScrollClassName].filter(Boolean).join(' ');

  return (
    <section className="flex min-h-0 flex-col p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
        <Layers3 className="h-4 w-4" />
        Hierarquia atual
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-500">
          <GripVertical className="h-3 w-3" />
          Arrastar ativo
        </span>
      </div>
      <div className={scrollClassName}>
        <CategoryHierarchyTree
          nodes={tree}
          isLoading={isLoading}
          isSaving={isSaving}
          isDeleting={isDeleting}
          interaction={interaction}
        />
      </div>
    </section>
  );
};
