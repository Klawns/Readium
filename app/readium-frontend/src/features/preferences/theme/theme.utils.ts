import { DEFAULT_THEME_ID, THEME_PRESETS, THEME_STORAGE_KEY } from './theme-presets';
import type { ThemeId, ThemePreset } from './theme.types';

export const findThemePreset = (themeId: ThemeId): ThemePreset =>
  THEME_PRESETS.find((preset) => preset.id === themeId) ?? THEME_PRESETS[0];

export const readThemeFromStorage = (): ThemeId => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_ID;
  }
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (value === 'classic' || value === 'ocean' || value === 'forest') {
    return value;
  }
  return DEFAULT_THEME_ID;
};

export const persistThemeToStorage = (themeId: ThemeId): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
};

export const applyThemeToDocument = (themeId: ThemeId): void => {
  if (typeof document === 'undefined') {
    return;
  }
  const preset = findThemePreset(themeId);
  const root = document.documentElement;
  for (const [variable, value] of Object.entries(preset.vars)) {
    root.style.setProperty(variable, value);
  }
};
