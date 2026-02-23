import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react';
import { DEFAULT_THEME_ID } from './theme-presets';
import type { ThemeId } from './theme.types';
import { applyThemeToDocument, persistThemeToStorage, readThemeFromStorage } from './theme.utils';
import { ThemeContext, type ThemeContextValue } from './theme-context';

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    const stored = readThemeFromStorage();
    setThemeId(stored);
    applyThemeToDocument(stored);
  }, []);

  const handleSetTheme = (nextThemeId: ThemeId) => {
    setThemeId(nextThemeId);
    persistThemeToStorage(nextThemeId);
    applyThemeToDocument(nextThemeId);
  };

  const value = useMemo<ThemeContextValue>(() => ({
    themeId,
    setThemeId: handleSetTheme,
  }), [themeId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
