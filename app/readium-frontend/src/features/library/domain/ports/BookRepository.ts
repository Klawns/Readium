import type { Book, BookPage, BookStatus, StatusFilter } from '@/types';

export interface BookRepository {
  getBooks(status?: StatusFilter, page?: number, size?: number, query?: string): Promise<BookPage>;
  upload(file: File): Promise<Book>;
  updateStatus(bookId: number, status: BookStatus): Promise<void>;
}
