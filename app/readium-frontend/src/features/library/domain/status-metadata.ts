import type { BookStatus, StatusFilter } from '@/types';

export const BOOK_STATUS_LABEL: Record<BookStatus, string> = {
  TO_READ: 'Para Ler',
  READING: 'Lendo',
  READ: 'Lido',
};

export const LIBRARY_FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'TO_READ', label: 'Para ler' },
  { value: 'READING', label: 'Lendo' },
  { value: 'READ', label: 'Lidos' },
];
