import { Palette, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';

interface CategoryCreationSidebarProps {
  newName: string;
  newColor: string;
  canCreate: boolean;
  isSaving: boolean;
  onChangeName: (value: string) => void;
  onChangeColor: (value: string) => void;
  onCreate: () => Promise<unknown>;
}

export const CategoryCreationSidebar = ({
  newName,
  newColor,
  canCreate,
  isSaving,
  onChangeName,
  onChangeColor,
  onCreate,
}: CategoryCreationSidebarProps) => (
  <aside className="border-b border-slate-200 bg-white p-4 md:border-b-0 md:border-r">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nova categoria raiz</p>
    <div className="mt-3 space-y-3">
      <Input value={newName} onChange={(event) => onChangeName(event.target.value)} placeholder="Ex: Arquitetura de Software" />
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-xs text-slate-600">
          <Palette className="h-4 w-4" />
          <input
            type="color"
            value={newColor}
            onChange={(event) => onChangeColor(event.target.value)}
            className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <Input value={newColor} onChange={(event) => onChangeColor(event.target.value)} className="h-9" />
      </div>
      <Button onClick={() => void onCreate()} disabled={!canCreate || isSaving} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Criar categoria
      </Button>
    </div>
    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
      <p className="font-medium text-slate-700">Dica</p>
      <p className="mt-1">Use arrastar e soltar para trocar o pai da categoria. Solte no bloco "Raiz" para remover o pai.</p>
    </div>
  </aside>
);
