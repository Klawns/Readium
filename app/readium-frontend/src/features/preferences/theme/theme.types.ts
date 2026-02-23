export type ThemeId = 'classic' | 'ocean' | 'forest';

export interface ThemePreset {
  id: ThemeId;
  name: string;
  vars: Record<string, string>;
}
