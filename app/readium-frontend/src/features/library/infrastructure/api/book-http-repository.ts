import { bookApi } from '@/services/bookApi';
import type { Book, BookPage, BookStatus, StatusFilter } from '@/types';
import type { BookRepository, UploadBookOptions } from '../../domain/ports/BookRepository';

export class BookHttpRepository implements BookRepository {
  getBooks(status?: StatusFilter, page?: number, size?: number, query?: string): Promise<BookPage> {
    return bookApi.getBooks(status, page, size, query);
  }

  upload(file: File, options?: UploadBookOptions): Promise<Book> {
    return bookApi.uploadBook(file, options);
  }

  updateStatus(bookId: number, status: BookStatus): Promise<void> {
    return bookApi.updateBookStatus(bookId, status);
  }
}
