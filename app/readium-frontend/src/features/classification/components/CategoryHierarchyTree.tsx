import type { CategoryTreeNode } from '../domain/category-tree';
import type { CategoryTreeInteraction } from './category-management.types';
import { CategoryTreeNodeList } from './CategoryTreeNodeList';

interface CategoryHierarchyTreeProps {
  nodes: CategoryTreeNode[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  interaction: CategoryTreeInteraction;
}

export const CategoryHierarchyTree = ({ nodes, isLoading, isSaving, isDeleting, interaction }: CategoryHierarchyTreeProps) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Carregando categorias...
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Nenhuma categoria criada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`rounded-lg border border-dashed px-3 py-2 text-xs text-slate-500 transition ${
          interaction.dragDrop.dropAsRoot ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          interaction.actions.onDragEnterTarget(null);
        }}
        onDrop={(event) => {
          event.preventDefault();
          void interaction.actions.onDropOnTarget(null);
        }}
      >
        Raiz (solte aqui para remover pai)
      </div>

      <CategoryTreeNodeList nodes={nodes} isSaving={isSaving} isDeleting={isDeleting} interaction={interaction} />
    </div>
  );
};
