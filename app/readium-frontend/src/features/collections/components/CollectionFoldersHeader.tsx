import { FolderKanban, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';

interface CollectionFoldersHeaderProps {
  collectionsCount: number;
  visibleBooksCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenManageCollections: () => void;
}

export const CollectionFoldersHeader = ({
  collectionsCount,
  visibleBooksCount,
  searchQuery,
  onSearchChange,
  onOpenManageCollections,
}: CollectionFoldersHeaderProps) => (
  <header className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Colecoes</h1>
        <p className="text-sm text-muted-foreground">Organize sua biblioteca por colecoes de forma objetiva.</p>
      </div>
      <Button onClick={onOpenManageCollections} className="gap-2">
        <Plus className="h-4 w-4" />
        Gerenciar colecoes
      </Button>
    </div>

    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="relative min-w-64 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar livro para organizar..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
        />
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
        <FolderKanban className="h-3.5 w-3.5" />
        {collectionsCount} colecoes
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
        {visibleBooksCount} livros visiveis
      </div>
    </div>
  </header>
);
