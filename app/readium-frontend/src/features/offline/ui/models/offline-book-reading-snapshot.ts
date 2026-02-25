import type { BookStatus } from '@/types';

export interface OfflineBookReadingSnapshot {
  status: BookStatus | null;
  lastReadPage: number | null;
  pages: number | null;
}
