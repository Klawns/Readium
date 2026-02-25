import type { CategoryTreeNode } from '../domain/category-tree';
import type { CategoryTreeInteraction } from './category-management.types';
import { CategoryTreeRow } from './CategoryTreeRow';

interface CategoryTreeNodeListProps {
  nodes: CategoryTreeNode[];
  isSaving: boolean;
  isDeleting: boolean;
  interaction: CategoryTreeInteraction;
}

export const CategoryTreeNodeList = ({ nodes, isSaving, isDeleting, interaction }: CategoryTreeNodeListProps) => (
  <>
    {nodes.map((node) => (
      <div key={node.category.id} className="space-y-1.5">
        <CategoryTreeRow node={node} isSaving={isSaving} isDeleting={isDeleting} interaction={interaction} />
        {node.children.length > 0 ? (
          <CategoryTreeNodeList
            nodes={node.children}
            isSaving={isSaving}
            isDeleting={isDeleting}
            interaction={interaction}
          />
        ) : null}
      </div>
    ))}
  </>
);
