import type { QueryClient } from '@tanstack/react-query';
import type { Book, BookPage, StatusFilter } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import { LIBRARY_PAGE_SIZE } from '../../domain/library.constants';

const normalizeText = (value: string | null | undefined): string => (value ?? '').trim().toLowerCase();

const matchesBookFilters = (book: Book, statusFilter: StatusFilter, searchQuery: string): boolean => {
  const statusMatches = statusFilter === 'ALL' || book.status === statusFilter;
  if (!statusMatches) {
    return false;
  }

  const normalizedSearch = normalizeText(searchQuery);
  if (!normalizedSearch) {
    return true;
  }

  const searchable = `${book.title} ${book.author ?? ''}`.toLowerCase();
  return searchable.includes(normalizedSearch);
};

const insertBookIntoPage = (page: BookPage, book: Book): BookPage => {
  if (page.content.some((item) => item.id === book.id)) {
    return page;
  }

  const pageSize = page.size > 0 ? page.size : LIBRARY_PAGE_SIZE;
  const nextTotalElements = page.totalElements + 1;
  const nextTotalPages = Math.max(1, Math.ceil(nextTotalElements / pageSize));
  const shouldInsertIntoContent = page.number === 0;
  const nextContent = shouldInsertIntoContent ? [book, ...page.content].slice(0, pageSize) : page.content;

  return {
    ...page,
    content: nextContent,
    totalElements: nextTotalElements,
    totalPages: nextTotalPages,
    empty: nextContent.length === 0,
    first: page.number === 0,
    last: page.number >= nextTotalPages - 1,
  };
};

export const updateLibraryCachesAfterUpload = (
  queryClient: QueryClient,
  createdBook: Book,
): void => {
  const bookQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.booksRoot() });
  for (const query of bookQueries) {
    const queryKey = query.queryKey;
    if (!Array.isArray(queryKey) || queryKey.length < 4) {
      continue;
    }

    const cachedStatus = queryKey[1];
    const cachedSearch = queryKey[3];
    if (typeof cachedStatus !== 'string' || typeof cachedSearch !== 'string') {
      continue;
    }

    if (!matchesBookFilters(createdBook, cachedStatus as StatusFilter, cachedSearch)) {
      continue;
    }

    queryClient.setQueryData<BookPage>(queryKey, (current) => {
      if (!current) {
        return current;
      }
      return insertBookIntoPage(current, createdBook);
    });
  }
};
