import type { ReactNode } from 'react';
import { BookOpen, Folder, FolderOpenDot, Plus } from 'lucide-react';
import type { ReadingCollection } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import type { CollectionExplorerFilter } from '../ui/hooks/useCollectionExplorerState';

interface CollectionExplorerSidebarProps {
  collections: ReadingCollection[];
  booksByCollectionId: Record<number, number>;
  unassignedCount: number;
  totalBooks: number;
  activeFilter: CollectionExplorerFilter;
  onSelectFilter: (filter: CollectionExplorerFilter) => void;
  onOpenManageCollections: () => void;
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

export const CollectionExplorerSidebar = ({
  collections,
  booksByCollectionId,
  unassignedCount,
  totalBooks,
  activeFilter,
  onSelectFilter,
  onOpenManageCollections,
}: CollectionExplorerSidebarProps) => (
  <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Colecoes</p>
      <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs" onClick={onOpenManageCollections}>
        <Plus className="h-3.5 w-3.5" />
        Gerenciar
      </Button>
    </div>

    <div className="space-y-1">
      <SidebarItem
        active={activeFilter === 'all'}
        label="Todos os livros"
        count={totalBooks}
        icon={<BookOpen className="h-4 w-4" />}
        onClick={() => onSelectFilter('all')}
      />
      <SidebarItem
        active={activeFilter === 'unassigned'}
        label="Sem colecao"
        count={unassignedCount}
        icon={<FolderOpenDot className="h-4 w-4" />}
        onClick={() => onSelectFilter('unassigned')}
      />
    </div>

    <div className="space-y-1 border-t border-slate-200 pt-2">
      {collections.map((collection) => (
        <SidebarItem
          key={collection.id}
          active={activeFilter === collection.id}
          label={collection.name}
          count={booksByCollectionId[collection.id] ?? 0}
          icon={<Folder className="h-4 w-4" />}
          onClick={() => onSelectFilter(collection.id)}
        />
      ))}
    </div>
  </aside>
);
