import type { Book, BookPage, BookStatus, StatusFilter } from '@/types';
import { updateBookStatusOfflineFirst } from '@/features/offline/application/services/offline-book-status-sync-service';
import { listOfflineLibraryBooksPage } from '@/features/offline/application/services/offline-library-books-service';
import type { BookRepository, UploadBookOptions } from '../../domain/ports/BookRepository';

export class BookLocalRepository implements BookRepository {
  getBooks(
    status: StatusFilter = 'ALL',
    page = 0,
    size = 12,
    query = '',
    categoryId: number | null = null,
    collectionId: number | null = null,
  ): Promise<BookPage> {
    return listOfflineLibraryBooksPage({
      status,
      page,
      size,
      query,
      categoryId,
      collectionId,
    });
  }

  async upload(_file: File, _options?: UploadBookOptions): Promise<Book> {
    throw new Error('Upload indisponivel no modo local.');
  }

  async updateStatus(bookId: number, status: BookStatus): Promise<void> {
    await updateBookStatusOfflineFirst({ bookId, status });
  }
}

