import { FolderTree, Search } from 'lucide-react';
import type { Category } from '@/types';
import AppLayout from '@/components/layout/AppLayout.tsx';
import { Input } from '@/components/ui/input.tsx';
import { CategoryExplorerSidebar } from '../components/CategoryExplorerSidebar';
import { CategoryManagementPanel } from '../components/CategoryManagementPanel';
import type {
  CreateCategoryHandler,
  DeleteCategoryHandler,
  MoveCategoryHandler,
  UpdateCategoryHandler,
} from '../domain/category-actions';
import type { CategoryExplorerFilter } from './hooks/useCategoryExplorerState';

interface CategoriesViewProps {
  categories: Category[];
  visibleCategories: Category[];
  rootCategories: Category[];
  descendantCountById: Record<number, number>;
  activeFilter: CategoryExplorerFilter;
  isLoading: boolean;
  isError: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  searchQuery: string;
  contentTitle: string;
  contentSubtitle: string;
  onSearchChange: (value: string) => void;
  onSelectFilter: (filter: CategoryExplorerFilter) => void;
  onCreateCategory: CreateCategoryHandler;
  onUpdateCategory: UpdateCategoryHandler;
  onMoveCategory: MoveCategoryHandler;
  onDeleteCategory: DeleteCategoryHandler;
  onOpenUpload: () => void;
}

export const CategoriesView = ({
  categories,
  visibleCategories,
  rootCategories,
  descendantCountById,
  activeFilter,
  isLoading,
  isError,
  isSaving,
  isDeleting,
  searchQuery,
  contentTitle,
  contentSubtitle,
  onSearchChange,
  onSelectFilter,
  onCreateCategory,
  onUpdateCategory,
  onMoveCategory,
  onDeleteCategory,
  onOpenUpload,
}: CategoriesViewProps) => (
  <AppLayout onUploadClick={onOpenUpload}>
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 animate-fade-in">
      <header className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground">Gerencie o cadastro e a hierarquia da classificacao da biblioteca.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar categoria..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
            <FolderTree className="h-3.5 w-3.5" />
            {categories.length} categorias
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
            {rootCategories.length} categorias raiz
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Erro ao carregar categorias.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <CategoryExplorerSidebar
            rootCategories={rootCategories}
            descendantCountById={descendantCountById}
            totalCategories={categories.length}
            activeFilter={activeFilter}
            onSelectFilter={onSelectFilter}
          />

          <section className="min-w-0 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">{contentTitle}</h2>
              <p className="text-xs text-slate-500">{contentSubtitle}</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
              <CategoryManagementPanel
                categories={visibleCategories}
                isLoading={isLoading}
                isSaving={isSaving}
                isDeleting={isDeleting}
                onCreateCategory={onCreateCategory}
                onUpdateCategory={onUpdateCategory}
                onMoveCategory={onMoveCategory}
                onDeleteCategory={onDeleteCategory}
                className="min-h-[520px]"
                treeScrollClassName="max-h-[min(56vh,38rem)]"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  </AppLayout>
);
