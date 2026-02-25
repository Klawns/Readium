import { Check, ChevronRight } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu.tsx';

export interface LibraryNestedFilterOption {
  id: number;
  name: string;
  depth: number;
}

interface LibraryFiltersNestedSectionProps {
  isMobile: boolean;
  title: string;
  selectedLabel: string;
  options: LibraryNestedFilterOption[];
  selectedId: number | null;
  allLabel: string;
  emptyLabel: string;
  manageLabel: string;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onSelect: (id: number | null) => void;
  onManage: () => void;
}

const renderOptions = (
  options: LibraryNestedFilterOption[],
  selectedId: number | null,
  onSelect: (id: number) => void,
  emptyLabel: string,
  basePadding: number,
) => {
  if (options.length === 0) {
    return <DropdownMenuItem disabled>{emptyLabel}</DropdownMenuItem>;
  }

  return options.map((option) => (
    <DropdownMenuItem
      key={option.id}
      onClick={() => onSelect(option.id)}
      className="justify-between gap-2"
      style={{ paddingLeft: `${basePadding + option.depth * 14}px` }}
    >
      <span className="truncate">{option.name}</span>
      {selectedId === option.id ? <Check className="h-4 w-4 text-slate-500" /> : null}
    </DropdownMenuItem>
  ));
};

export const LibraryFiltersNestedSection = ({
  isMobile,
  title,
  selectedLabel,
  options,
  selectedId,
  allLabel,
  emptyLabel,
  manageLabel,
  isExpanded,
  onExpandedChange,
  onSelect,
  onManage,
}: LibraryFiltersNestedSectionProps) => {
  if (isMobile) {
    return (
      <>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            onExpandedChange(!isExpanded);
          }}
          className="justify-between gap-2"
        >
          <div className="min-w-0">
            <p className="truncate">{title}</p>
            <p className="truncate text-xs font-normal text-slate-500">{selectedLabel}</p>
          </div>
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </DropdownMenuItem>

        {isExpanded ? (
          <div className="mb-1 ml-2 space-y-1 border-l border-slate-200 pl-2">
            <DropdownMenuItem onClick={() => onSelect(null)} className="justify-between gap-2">
              <span>{allLabel}</span>
              {selectedId == null ? <Check className="h-4 w-4 text-slate-500" /> : null}
            </DropdownMenuItem>
            <div className="max-h-[min(36dvh,14rem)] overflow-y-auto">
              {renderOptions(options, selectedId, onSelect, emptyLabel, 8)}
            </div>
            <DropdownMenuItem onClick={onManage} className="text-slate-600">
              {manageLabel}
            </DropdownMenuItem>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="justify-between gap-2">
        <span className="truncate">{title}</span>
        <span className="max-w-[9rem] truncate text-xs font-normal text-slate-500">{selectedLabel}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        side="right"
        align="start"
        sideOffset={6}
        className="w-[min(24rem,calc(100vw-1rem))] max-h-[75dvh]"
      >
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSelect(null)} className="justify-between gap-2">
          <span>{allLabel}</span>
          {selectedId == null ? <Check className="h-4 w-4 text-slate-500" /> : null}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="max-h-[min(40dvh,14rem)] overflow-y-auto">
          {renderOptions(options, selectedId, onSelect, emptyLabel, 10)}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onManage} className="text-slate-600">
          {manageLabel}
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
