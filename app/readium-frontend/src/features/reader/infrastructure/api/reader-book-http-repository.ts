import { bookApi } from '@/services/bookApi.ts';
import type {
  Book,
  BookOcrStatusResponse,
  BookStatus,
  BookTextLayerQualityResponse,
} from '@/types';
import type { ReaderBookRepository } from '../../domain/ports/ReaderBookRepository';

export class ReaderBookHttpRepository implements ReaderBookRepository {
  async getBook(bookId: number): Promise<Book> {
    return bookApi.getBook(bookId);
  }

  async getOcrStatus(bookId: number): Promise<BookOcrStatusResponse> {
    return bookApi.getOcrStatus(bookId);
  }

  async getTextLayerQuality(bookId: number): Promise<BookTextLayerQualityResponse> {
    return bookApi.getTextLayerQuality(bookId);
  }

  async updateBookStatus(bookId: number, status: BookStatus): Promise<void> {
    await bookApi.updateBookStatus(bookId, status);
  }

  async triggerOcr(bookId: number): Promise<void> {
    await bookApi.triggerOcr(bookId);
  }

  getBookFileUrl(bookId: number, version?: string | null): string {
    return bookApi.getBookFileUrl(bookId, version);
  }
}

