export type CollectionTemplateId = 'classic' | 'ocean' | 'forest' | 'sunset' | 'graphite';

export interface CollectionTemplatePreset {
  id: CollectionTemplateId;
  label: string;
  description: string;
  chipClassName: string;
  panelClassName: string;
}

