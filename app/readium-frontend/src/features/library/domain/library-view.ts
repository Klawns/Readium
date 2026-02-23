import type { StatusFilter } from '@/types';

export type LibraryLayoutMode = 'grid' | 'compact';

export interface SavedLibraryView {
  id: string;
  name: string;
  statusFilter: StatusFilter;
  searchQuery: string;
  categoryId: number | null;
  layoutMode: LibraryLayoutMode;
  createdAt: string;
}

export interface LibraryViewSnapshot {
  statusFilter: StatusFilter;
  searchQuery: string;
  categoryId: number | null;
  layoutMode: LibraryLayoutMode;
}
