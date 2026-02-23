import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { BookHttpRepository } from '../../infrastructure/api/book-http-repository';
import { FetchLibraryBooksUseCase } from '../../application/use-cases/library-use-cases';

const LOOKUP_PAGE_SIZE = 80;
const LOOKUP_DEBOUNCE_MS = 250;

const repository = new BookHttpRepository();
const fetchLibraryBooksUseCase = new FetchLibraryBooksUseCase(repository);

export const useLibraryBookLookup = (rawQuery: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(rawQuery.trim());
    }, LOOKUP_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [rawQuery]);

  const lookupQuery = useQuery({
    queryKey: queryKeys.booksLookup(debouncedQuery),
    queryFn: () => fetchLibraryBooksUseCase.execute('ALL', 0, LOOKUP_PAGE_SIZE, debouncedQuery, null, null),
    staleTime: 20_000,
  });

  return {
    books: lookupQuery.data?.content ?? [],
    totalBooks: lookupQuery.data?.totalElements ?? 0,
    isLoading: lookupQuery.isLoading,
    isError: lookupQuery.isError,
  };
};
