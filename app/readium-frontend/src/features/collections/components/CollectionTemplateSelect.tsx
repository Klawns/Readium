import type { FC } from 'react';
import { COLLECTION_TEMPLATE_PRESETS } from '../application/services/collection-template-presets';

interface CollectionTemplateSelectProps {
  value: string;
  onChange: (templateId: string) => void;
}

export const CollectionTemplateSelect: FC<CollectionTemplateSelectProps> = ({ value, onChange }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Template</p>
    <div className="flex flex-wrap gap-2">
      {COLLECTION_TEMPLATE_PRESETS.map((template) => {
        const active = template.id === value;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? 'border-slate-900 bg-slate-900 text-white'
                : `${template.chipClassName} hover:border-slate-400`
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${active ? 'bg-white/80' : 'bg-slate-400'}`}
              aria-hidden="true"
            />
            <span>{template.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);
