import { type FC } from 'react';
import { Layers3, Settings2 } from 'lucide-react';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button.tsx';

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  onManageCategories: () => void;
}

export const CategoryFilterBar: FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onManageCategories,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Layers3 className="h-4 w-4 text-slate-600" />
          <p className="text-sm font-medium text-slate-700">Filtrar por categoria</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 self-start lg:self-auto" onClick={onManageCategories}>
          <Settings2 className="h-4 w-4" />
          Gerenciar categorias
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            selectedCategoryId == null
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
          }`}
        >
          Todas
        </button>

        {categories.map((category) => {
          const isActive = selectedCategoryId === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isActive ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
              <span>{category.name}</span>
              <span className={`${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{category.booksCount}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
