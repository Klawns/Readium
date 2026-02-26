import type { Book, BookPage, BookStatus, StatusFilter } from '@/types';
import type { BookRepository, UploadBookOptions } from '../../domain/ports/BookRepository';

export interface LibraryUseCases {
  fetchBooks: (
    status: StatusFilter,
    page: number,
    size: number,
    query: string,
    categoryId: number | null,
    collectionId: number | null,
  ) => Promise<BookPage>;
  uploadBook: (file: File, options?: UploadBookOptions) => Promise<Book>;
  updateBookStatus: (bookId: number, status: BookStatus) => Promise<void>;
  deleteBook: (bookId: number) => Promise<void>;
}

export const createLibraryUseCases = (repository: BookRepository): LibraryUseCases => ({
  fetchBooks: (status, page, size, query, categoryId, collectionId) =>
    repository.getBooks(status, page, size, query, categoryId, collectionId),
  uploadBook: (file, options) => repository.upload(file, options),
  updateBookStatus: (bookId, status) => repository.updateStatus(bookId, status),
  deleteBook: (bookId) => repository.delete(bookId),
});
