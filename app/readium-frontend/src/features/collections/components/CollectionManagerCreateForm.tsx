import { BookmarkPlus, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { CollectionTemplateSelect } from './CollectionTemplateSelect';
import {
  CollectionManagerBookPicker,
  type CollectionManagerBookPickerProps,
} from './CollectionManagerBookPicker';

interface CollectionManagerCreateFormProps extends CollectionManagerBookPickerProps {
  name: string;
  description: string;
  color: string;
  icon: string;
  templateId: string;
  canCreate: boolean;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
  onCreate: () => void;
}

export const CollectionManagerCreateForm = ({
  name,
  description,
  color,
  icon,
  templateId,
  canCreate,
  isSaving,
  onNameChange,
  onDescriptionChange,
  onColorChange,
  onIconChange,
  onTemplateChange,
  onCreate,
  ...bookPickerProps
}: CollectionManagerCreateFormProps) => (
  <aside className="border-b border-slate-200 bg-white p-4 md:min-h-0 md:overflow-y-auto md:border-b-0 md:border-r">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nova colecao</p>
    <div className="mt-3 space-y-3">
      <Input
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Ex: Arquitetura em foco"
      />
      <textarea
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Descricao opcional"
        className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input value={color} onChange={(event) => onColorChange(event.target.value)} className="h-9" />
        <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-xs text-slate-600">
          <Palette className="h-4 w-4" />
          <input
            type="color"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
            className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
      </div>
      <Input
        value={icon}
        onChange={(event) => onIconChange(event.target.value)}
        placeholder="Icone (ex: books)"
        className="h-9"
      />
      <CollectionTemplateSelect value={templateId} onChange={onTemplateChange} />

      <CollectionManagerBookPicker {...bookPickerProps} />

      <Button onClick={onCreate} disabled={!canCreate || isSaving} className="w-full gap-2">
        <BookmarkPlus className="h-4 w-4" />
        Criar colecao
      </Button>
    </div>
  </aside>
);
