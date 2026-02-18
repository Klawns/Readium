import type { Book, BookPage, BookStatus, StatusFilter } from '@/types';
import type { BookRepository, UploadBookOptions } from '../../domain/ports/BookRepository';

export class FetchLibraryBooksUseCase {
  constructor(private readonly repository: BookRepository) {}

  execute(status: StatusFilter, page: number, size: number, query: string): Promise<BookPage> {
    return this.repository.getBooks(status, page, size, query);
  }
}

export class UploadLibraryBookUseCase {
  constructor(private readonly repository: BookRepository) {}

  execute(file: File, options?: UploadBookOptions): Promise<Book> {
    return this.repository.upload(file, options);
  }
}

export class UpdateLibraryBookStatusUseCase {
  constructor(private readonly repository: BookRepository) {}

  execute(bookId: number, status: BookStatus): Promise<void> {
    return this.repository.updateStatus(bookId, status);
  }
}
