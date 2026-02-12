import type { Book, BookPage, BookStatus, StatusFilter } from '@/types';
import type { BookRepository } from '../../domain/ports/BookRepository';

export class FetchLibraryBooksUseCase {
  constructor(private readonly repository: BookRepository) {}

  execute(status: StatusFilter, page: number, size: number, query: string): Promise<BookPage> {
    return this.repository.getBooks(status, page, size, query);
  }
}

export class UploadLibraryBookUseCase {
  constructor(private readonly repository: BookRepository) {}

  execute(file: File): Promise<Book> {
    return this.repository.upload(file);
  }
}

export class UpdateLibraryBookStatusUseCase {
  constructor(private readonly repository: BookRepository) {}

  execute(bookId: number, status: BookStatus): Promise<void> {
    return this.repository.updateStatus(bookId, status);
  }
}
