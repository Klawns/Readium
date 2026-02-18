export const queryKeys = {
  booksRoot: () => ['books'] as const,
  books: (statusFilter: string, page: number, searchQuery: string) =>
    ['books', statusFilter, page, searchQuery] as const,
  book: (bookId: number) => ['book', bookId] as const,
  bookOcrStatus: (bookId: number) => ['book', bookId, 'ocr-status'] as const,
  bookTextLayerQuality: (bookId: number) => ['book', bookId, 'text-layer-quality'] as const,
  readerAnnotationsRoot: (bookId: number) => ['reader', 'annotations', bookId] as const,
  readerAnnotationsAll: (bookId: number) => ['reader', 'annotations', bookId, 'all'] as const,
  readerAnnotationsPage: (bookId: number, page: number) =>
    ['reader', 'annotations', bookId, 'page', page] as const,
  readerTranslations: (bookId: number) => ['reader', 'translations', bookId] as const,
};

