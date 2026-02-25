import { Save, X } from 'lucide-react';
import type { ReadingCollection } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { CollectionTemplateSelect } from './CollectionTemplateSelect';

interface CollectionManagerEditFormProps {
  collection: ReadingCollection;
  name: string;
  description: string;
  color: string;
  icon: string;
  templateId: string;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const CollectionManagerEditForm = ({
  collection,
  name,
  description,
  color,
  icon,
  templateId,
  isSaving,
  onNameChange,
  onDescriptionChange,
  onColorChange,
  onIconChange,
  onTemplateChange,
  onCancel,
  onSave,
}: CollectionManagerEditFormProps) => (
  <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Editando: {collection.name}
      </p>
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
    <div className="grid gap-2 md:grid-cols-2">
      <Input value={name} onChange={(event) => onNameChange(event.target.value)} className="md:col-span-2" />
      <textarea
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        className="min-h-16 rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
      />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input value={color} onChange={(event) => onColorChange(event.target.value)} className="h-9" />
        <input
          type="color"
          value={color}
          onChange={(event) => onColorChange(event.target.value)}
          className="h-9 w-10 cursor-pointer rounded border border-slate-200 bg-transparent p-1"
        />
      </div>
      <Input value={icon} onChange={(event) => onIconChange(event.target.value)} className="h-9" />
      <div className="md:col-span-2">
        <CollectionTemplateSelect value={templateId} onChange={onTemplateChange} />
      </div>
    </div>
    <div className="mt-3 flex items-center gap-2">
      <Button
        size="sm"
        onClick={onSave}
        disabled={isSaving || !name.trim()}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        Salvar
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  </div>
);
