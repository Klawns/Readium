import { X } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import type { ActiveLibraryFilter } from '../ui/hooks/useLibraryCommandBarState';

interface LibraryActiveFiltersProps {
  filters: ActiveLibraryFilter[];
  onClearFilter: (filterId: ActiveLibraryFilter['id']) => void;
  onClearAll: () => void;
}

export const LibraryActiveFilters = ({
  filters,
  onClearFilter,
  onClearAll,
}: LibraryActiveFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    {filters.map((filter) => (
      <button
        key={filter.id}
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 transition hover:border-slate-300"
        onClick={() => onClearFilter(filter.id)}
      >
        <span>{filter.label}</span>
        <X className="h-3.5 w-3.5 text-slate-500" />
      </button>
    ))}
    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-slate-600" onClick={onClearAll}>
      Limpar tudo
    </Button>
  </div>
);
