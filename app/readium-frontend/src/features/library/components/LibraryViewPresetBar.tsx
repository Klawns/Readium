import { useState } from 'react';
import { BookmarkPlus, LayoutGrid, Rows3, Trash2, View } from 'lucide-react';
import type { SavedLibraryView, LibraryLayoutMode } from '../domain/library-view';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface LibraryViewPresetBarProps {
  layoutMode: LibraryLayoutMode;
  onLayoutModeChange: (layoutMode: LibraryLayoutMode) => void;
  savedViews: SavedLibraryView[];
  onApplyView: (view: SavedLibraryView) => void;
  onSaveView: (name: string) => void;
  onDeleteView: (viewId: string) => void;
}

export const LibraryViewPresetBar: React.FC<LibraryViewPresetBarProps> = ({
  layoutMode,
  onLayoutModeChange,
  savedViews,
  onApplyView,
  onSaveView,
  onDeleteView,
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState('');

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/80 p-3">
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        <Button
          size="sm"
          variant={layoutMode === 'grid' ? 'default' : 'ghost'}
          onClick={() => onLayoutModeChange('grid')}
          className="h-8 gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Grade
        </Button>
        <Button
          size="sm"
          variant={layoutMode === 'compact' ? 'default' : 'ghost'}
          onClick={() => onLayoutModeChange('compact')}
          className="h-8 gap-2"
        >
          <Rows3 className="h-4 w-4" />
          Compacto
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <View className="h-4 w-4" />
            Views salvas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          {savedViews.length === 0 ? (
            <DropdownMenuItem disabled>Nenhuma view salva ainda.</DropdownMenuItem>
          ) : (
            savedViews.map((savedView) => (
              <DropdownMenuItem
                key={savedView.id}
                className="flex items-center justify-between gap-2"
                onClick={() => onApplyView(savedView)}
              >
                <span className="truncate">{savedView.name}</span>
                <button
                  type="button"
                  className="rounded p-1 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteView(savedView.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Salvar view atual
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar view atual</DialogTitle>
            <DialogDescription>
              Salve filtros e layout atuais para reuso rapido.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            placeholder="Ex: Estudo de arquitetura"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onSaveView(viewName);
                setViewName('');
                setSaveDialogOpen(false);
              }}
              disabled={!viewName.trim()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
