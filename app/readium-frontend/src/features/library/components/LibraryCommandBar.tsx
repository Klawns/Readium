import { Check, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Category, ReadingCollection, StatusFilter } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { LIBRARY_FILTER_OPTIONS } from '../domain/status-metadata';
import { useLibraryCommandBarState } from '../ui/hooks/useLibraryCommandBarState';
import { LibraryActiveFilters } from './LibraryActiveFilters';

interface LibraryCommandBarProps {
  searchValue: string;
  statusFilter: StatusFilter;
  categories: Category[];
  collections: ReadingCollection[];
  selectedCategoryId: number | null;
  selectedCollectionId: number | null;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onCollectionChange: (collectionId: number | null) => void;
  onClearAllFilters: () => void;
  onOpenCategoryManager: () => void;
  onOpenCollectionManager: () => void;
  onOpenUpload: () => void;
}

export const LibraryCommandBar = ({
  searchValue,
  statusFilter,
  categories,
  collections,
  selectedCategoryId,
  selectedCollectionId,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onCollectionChange,
  onClearAllFilters,
  onOpenCategoryManager,
  onOpenCollectionManager,
  onOpenUpload,
}: LibraryCommandBarProps) => {
  const state = useLibraryCommandBarState({
    categories,
    collections,
    statusFilter,
    selectedCategoryId,
    selectedCollectionId,
  });

  const clearFilter = (filterId: 'status' | 'category' | 'collection') => {
    if (filterId === 'status') {
      onStatusChange('ALL');
      return;
    }
    if (filterId === 'category') {
      onCategoryChange(null);
      return;
    }
    onCollectionChange(null);
  };

  const clearAllFilters = () => {
    onClearAllFilters();
  };

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Buscar por titulo ou autor..."
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-10 border-slate-200 pl-9 pr-9"
          />
          {searchValue.trim() ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              onClick={() => onSearchChange('')}
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {LIBRARY_FILTER_OPTIONS.map((option) => {
              const isActive = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStatusChange(option.value)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-200">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Categoria</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onCategoryChange(null)} className="justify-between gap-2">
                <span>Todas as categorias</span>
                {selectedCategoryId == null ? <Check className="h-4 w-4 text-slate-500" /> : null}
              </DropdownMenuItem>
              <div className="max-h-52 overflow-y-auto">
                {state.flattenedCategories.map((node) => (
                  <DropdownMenuItem
                    key={node.category.id}
                    onClick={() => onCategoryChange(node.category.id)}
                    className="justify-between gap-2"
                    style={{ paddingLeft: `${8 + node.depth * 14}px` }}
                  >
                    <span className="truncate">{node.category.name}</span>
                    {selectedCategoryId === node.category.id ? (
                      <Check className="h-4 w-4 text-slate-500" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuItem onClick={onOpenCategoryManager} className="text-slate-600">
                Gerenciar categorias
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Colecao</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onCollectionChange(null)} className="justify-between gap-2">
                <span>Todas as colecoes</span>
                {selectedCollectionId == null ? <Check className="h-4 w-4 text-slate-500" /> : null}
              </DropdownMenuItem>
              <div className="max-h-52 overflow-y-auto">
                {collections.map((collection) => (
                  <DropdownMenuItem
                    key={collection.id}
                    onClick={() => onCollectionChange(collection.id)}
                    className="justify-between gap-2"
                  >
                    <span className="truncate">{collection.name}</span>
                    {selectedCollectionId === collection.id ? (
                      <Check className="h-4 w-4 text-slate-500" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuItem onClick={onOpenCollectionManager} className="text-slate-600">
                Gerenciar colecoes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={onOpenUpload} className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {state.hasActiveFilters ? (
        <LibraryActiveFilters
          filters={state.activeFilters}
          onClearFilter={clearFilter}
          onClearAll={clearAllFilters}
        />
      ) : null}
    </section>
  );
};
