import { FolderTree, Layers3, Tag } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Category } from '@/types';
import type { CategoryExplorerFilter } from '../ui/hooks/useCategoryExplorerState';

interface CategoryExplorerSidebarProps {
  rootCategories: Category[];
  descendantCountById: Record<number, number>;
  totalCategories: number;
  activeFilter: CategoryExplorerFilter;
  onSelectFilter: (filter: CategoryExplorerFilter) => void;
}

const SidebarItem = ({
  active,
  label,
  count,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  icon: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
      active
        ? 'border-slate-900 bg-slate-900 text-white'
        : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'
    }`}
  >
    <span className={`${active ? 'text-slate-100' : 'text-slate-500'}`}>{icon}</span>
    <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
    <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-600'}`}>
      {count}
    </span>
  </button>
);

export const CategoryExplorerSidebar = ({
  rootCategories,
  descendantCountById,
  totalCategories,
  activeFilter,
  onSelectFilter,
}: CategoryExplorerSidebarProps) => (
  <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex items-center gap-2">
      <FolderTree className="h-4 w-4 text-slate-500" />
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categorias</p>
    </div>

    <div className="space-y-1">
      <SidebarItem
        active={activeFilter === 'all'}
        label="Todas as categorias"
        count={totalCategories}
        icon={<Layers3 className="h-4 w-4" />}
        onClick={() => onSelectFilter('all')}
      />
    </div>

    <div className="space-y-1 border-t border-slate-200 pt-2">
      {rootCategories.map((category) => (
        <SidebarItem
          key={category.id}
          active={activeFilter === category.id}
          label={category.name}
          count={descendantCountById[category.id] ?? 0}
          icon={<Tag className="h-4 w-4" />}
          onClick={() => onSelectFilter(category.id)}
        />
      ))}
    </div>
  </aside>
);
