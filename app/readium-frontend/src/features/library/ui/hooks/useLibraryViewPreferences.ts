import { useMemo, useState } from 'react';
import type { LibraryLayoutMode, LibraryViewSnapshot, SavedLibraryView } from '../../domain/library-view';

const LAYOUT_STORAGE_KEY = 'readium:library:layout';
const VIEWS_STORAGE_KEY = 'readium:library:saved-views';

const readLayout = (): LibraryLayoutMode => {
  if (typeof window === 'undefined') {
    return 'grid';
  }
  const value = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
  return value === 'compact' ? 'compact' : 'grid';
};

const persistLayout = (layoutMode: LibraryLayoutMode) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode);
};

const readSavedViews = (): SavedLibraryView[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = window.localStorage.getItem(VIEWS_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as Array<Partial<SavedLibraryView>>;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((view): view is Partial<SavedLibraryView> & { id: string; name: string; createdAt: string } =>
        typeof view.id === 'string' && typeof view.name === 'string' && typeof view.createdAt === 'string',
      )
      .map((view) => ({
        id: view.id,
        name: view.name,
        statusFilter: view.statusFilter === 'READ' || view.statusFilter === 'READING' || view.statusFilter === 'TO_READ'
          ? view.statusFilter
          : 'ALL',
        searchQuery: typeof view.searchQuery === 'string' ? view.searchQuery : '',
        categoryId: typeof view.categoryId === 'number' ? view.categoryId : null,
        collectionId: typeof view.collectionId === 'number' ? view.collectionId : null,
        layoutMode: view.layoutMode === 'compact' ? 'compact' : 'grid',
        createdAt: view.createdAt,
      }));
  } catch {
    return [];
  }
};

const persistSavedViews = (views: SavedLibraryView[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(views));
};

const createViewId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useLibraryViewPreferences = () => {
  const [layoutMode, setLayoutModeState] = useState<LibraryLayoutMode>(readLayout);
  const [savedViews, setSavedViews] = useState<SavedLibraryView[]>(readSavedViews);

  const setLayoutMode = (nextLayoutMode: LibraryLayoutMode) => {
    setLayoutModeState(nextLayoutMode);
    persistLayout(nextLayoutMode);
  };

  const saveCurrentView = (name: string, snapshot: LibraryViewSnapshot): SavedLibraryView => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new Error('Nome da view e obrigatorio.');
    }

    const view: SavedLibraryView = {
      id: createViewId(),
      name: normalizedName,
      statusFilter: snapshot.statusFilter,
      searchQuery: snapshot.searchQuery.trim(),
      categoryId: snapshot.categoryId,
      collectionId: snapshot.collectionId,
      layoutMode: snapshot.layoutMode,
      createdAt: new Date().toISOString(),
    };

    setSavedViews((current) => {
      const next = [view, ...current].slice(0, 20);
      persistSavedViews(next);
      return next;
    });

    return view;
  };

  const deleteSavedView = (viewId: string) => {
    setSavedViews((current) => {
      const next = current.filter((view) => view.id !== viewId);
      persistSavedViews(next);
      return next;
    });
  };

  const orderedSavedViews = useMemo(
    () => [...savedViews].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [savedViews],
  );

  return {
    layoutMode,
    setLayoutMode,
    savedViews: orderedSavedViews,
    saveCurrentView,
    deleteSavedView,
  };
};
