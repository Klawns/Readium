import type { Book, BookPage, BookStatus, StatusFilter } from '@/types';

export interface UploadBookOptions {
  onProgress?: (progressPercent: number) => void;
}

export interface BookRepository {
  getBooks(status?: StatusFilter, page?: number, size?: number, query?: string): Promise<BookPage>;
  upload(file: File, options?: UploadBookOptions): Promise<Book>;
  updateStatus(bookId: number, status: BookStatus): Promise<void>;
}
