import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { StatusFilter } from '@/types';

interface UpdateLibrarySearchParamsInput {
  status?: StatusFilter;
  page?: number;
  query?: string;
}

const parseStatusFilter = (value: string | null): StatusFilter => {
  if (value === 'READING' || value === 'TO_READ' || value === 'READ' || value === 'ALL') {
    return value;
  }
  return 'ALL';
};

const parsePage = (value: string | null): number => {
  const parsed = Number.parseInt(value || '0', 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
};

export const useLibrarySearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = parseStatusFilter(searchParams.get('status'));
  const page = parsePage(searchParams.get('page'));
  const searchQuery = (searchParams.get('query') || '').trim();

  const updateParams = useCallback((next: UpdateLibrarySearchParamsInput) => {
    const nextStatus = next.status ?? statusFilter;
    const nextPage = Math.max(0, next.page ?? page);
    const nextQuery = (next.query ?? searchQuery).trim();

    const params = new URLSearchParams();
    params.set('status', nextStatus);
    params.set('page', nextPage.toString());
    if (nextQuery) {
      params.set('query', nextQuery);
    }

    setSearchParams(params);
  }, [page, searchQuery, setSearchParams, statusFilter]);

  return {
    statusFilter,
    page,
    searchQuery,
    updateParams,
  };
};
