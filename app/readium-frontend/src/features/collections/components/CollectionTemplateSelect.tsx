import type { FC } from 'react';
import { COLLECTION_TEMPLATE_PRESETS } from '../application/services/collection-template-presets';

interface CollectionTemplateSelectProps {
  value: string;
  onChange: (templateId: string) => void;
}

export const CollectionTemplateSelect: FC<CollectionTemplateSelectProps> = ({ value, onChange }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Template visual</p>
    <div className="grid gap-2 sm:grid-cols-2">
      {COLLECTION_TEMPLATE_PRESETS.map((template) => {
        const active = template.id === value;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            className={`rounded-lg border p-3 text-left transition ${
              active ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-400'
            }`}
          >
            <div className={`rounded-md border px-2 py-1 text-xs font-medium ${template.chipClassName}`}>
              {template.label}
            </div>
            <p className="mt-2 text-xs text-slate-500">{template.description}</p>
          </button>
        );
      })}
    </div>
  </div>
);

