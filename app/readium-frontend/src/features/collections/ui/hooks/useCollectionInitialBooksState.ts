import { useCallback, useMemo, useState } from 'react';

export const useCollectionInitialBooksState = () => {
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);

  const selectedSet = useMemo(() => new Set(selectedBookIds), [selectedBookIds]);

  const toggleBook = useCallback((bookId: number) => {
    setSelectedBookIds((current) => {
      if (current.includes(bookId)) {
        return current.filter((id) => id !== bookId);
      }
      return [...current, bookId];
    });
  }, []);

  const clearSelectedBooks = useCallback(() => setSelectedBookIds([]), []);

  const selectBooks = useCallback((bookIds: number[]) => {
    const sanitized = Array.from(
      new Set(bookIds.filter((bookId) => Number.isFinite(bookId) && bookId > 0)),
    );
    if (sanitized.length === 0) {
      return;
    }
    setSelectedBookIds((current) => Array.from(new Set([...current, ...sanitized])));
  }, []);

  return {
    selectedBookIds,
    selectedBooksCount: selectedBookIds.length,
    isBookSelected: (bookId: number) => selectedSet.has(bookId),
    toggleBook,
    selectBooks,
    clearSelectedBooks,
  };
};
