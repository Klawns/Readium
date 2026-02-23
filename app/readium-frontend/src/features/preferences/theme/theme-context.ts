import { createContext } from 'react';
import type { ThemeId } from './theme.types';

export interface ThemeContextValue {
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
