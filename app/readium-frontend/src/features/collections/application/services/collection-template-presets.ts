import type { CollectionTemplatePreset } from '../../domain/collection-template';

export const COLLECTION_TEMPLATE_PRESETS: CollectionTemplatePreset[] = [
  {
    id: 'classic',
    label: 'Classico',
    description: 'Visual limpo com contraste neutro.',
    chipClassName: 'bg-white text-slate-800 border-slate-300',
    panelClassName: 'from-white to-slate-50 border-slate-200',
  },
  {
    id: 'ocean',
    label: 'Oceano',
    description: 'Tons frios para foco tecnico.',
    chipClassName: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    panelClassName: 'from-cyan-50 to-sky-100 border-cyan-200',
  },
  {
    id: 'forest',
    label: 'Floresta',
    description: 'Paleta verde para estudos longos.',
    chipClassName: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    panelClassName: 'from-emerald-50 to-lime-100 border-emerald-200',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    description: 'Energia alta com tons quentes.',
    chipClassName: 'bg-amber-50 text-amber-900 border-amber-300',
    panelClassName: 'from-amber-50 to-orange-100 border-amber-300',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    description: 'Visual sobrio para colecoes premium.',
    chipClassName: 'bg-slate-900 text-slate-100 border-slate-700',
    panelClassName: 'from-slate-700 to-slate-900 border-slate-600',
  },
];

export const resolveCollectionTemplate = (templateId?: string): CollectionTemplatePreset =>
  COLLECTION_TEMPLATE_PRESETS.find((template) => template.id === templateId) ?? COLLECTION_TEMPLATE_PRESETS[0];
