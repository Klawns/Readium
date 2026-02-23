import { Filter, FolderKanban, Layers3, X } from 'lucide-react';
import type { Category, ReadingCollection } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useCategoryHierarchy } from '@/features/classification/ui/hooks/useCategoryHierarchy';

interface LibraryTaxonomyFiltersProps {
  categories: Category[];
  collections: ReadingCollection[];
  selectedCategoryId: number | null;
  selectedCollectionId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  onCollectionChange: (collectionId: number | null) => void;
  onManageCategories: () => void;
  onManageCollections: () => void;
}

const buildCategoryLabel = (
  selectedCategoryId: number | null,
  categories: ReturnType<typeof useCategoryHierarchy>['flattened'],
) => {
  if (selectedCategoryId == null) {
    return 'Todas as categorias';
  }
  const selected = categories.find((node) => node.category.id === selectedCategoryId);
  return selected ? selected.category.name : 'Categoria';
};

const buildCollectionLabel = (
  selectedCollectionId: number | null,
  collections: ReadingCollection[],
) => {
  if (selectedCollectionId == null) {
    return 'Todas as colecoes';
  }
  const selected = collections.find((collection) => collection.id === selectedCollectionId);
  return selected ? selected.name : 'Colecao';
};

export const LibraryTaxonomyFilters = ({
  categories,
  collections,
  selectedCategoryId,
  selectedCollectionId,
  onCategoryChange,
  onCollectionChange,
  onManageCategories,
  onManageCollections,
}: LibraryTaxonomyFiltersProps) => {
  const { flattened } = useCategoryHierarchy(categories);
  const categoryLabel = buildCategoryLabel(selectedCategoryId, flattened);
  const collectionLabel = buildCollectionLabel(selectedCollectionId, collections);
  const hasActiveFilters = selectedCategoryId != null || selectedCollectionId != null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
          <Filter className="h-3.5 w-3.5" />
          Filtros
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="max-w-full justify-start gap-2">
              <Layers3 className="h-4 w-4" />
              <span className="truncate">{categoryLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>Categorias</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onCategoryChange(null)}>Todas as categorias</DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              {flattened.map((node) => (
                <DropdownMenuItem
                  key={node.category.id}
                  onClick={() => onCategoryChange(node.category.id)}
                  className="gap-2"
                  style={{ paddingLeft: `${8 + node.depth * 14}px` }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: node.category.color }} />
                  <span className="flex-1 truncate">{node.category.name}</span>
                  <span className="text-xs text-slate-500">{node.category.booksCount}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onManageCategories}>Gerenciar categorias</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="max-w-full justify-start gap-2">
              <FolderKanban className="h-4 w-4" />
              <span className="truncate">{collectionLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>Colecoes</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onCollectionChange(null)}>Todas as colecoes</DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              {collections.map((collection) => (
                <DropdownMenuItem
                  key={collection.id}
                  onClick={() => onCollectionChange(collection.id)}
                  className="gap-2"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: collection.color }} />
                  <span className="flex-1 truncate">{collection.name}</span>
                  <span className="text-xs text-slate-500">{collection.booksCount}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onManageCollections}>Gerenciar colecoes</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters ? (
          <Button
            size="sm"
            variant="ghost"
            className="gap-2 text-slate-600"
            onClick={() => {
              onCategoryChange(null);
              onCollectionChange(null);
            }}
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        ) : null}
      </div>
    </div>
  );
};
