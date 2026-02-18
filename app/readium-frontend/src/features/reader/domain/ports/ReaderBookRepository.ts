import type {
  Book,
  BookOcrStatusResponse,
  BookStatus,
  BookTextLayerQualityResponse,
} from '@/types';

export interface ReaderBookRepository {
  getBook(bookId: number): Promise<Book>;
  getOcrStatus(bookId: number): Promise<BookOcrStatusResponse>;
  getTextLayerQuality(bookId: number): Promise<BookTextLayerQualityResponse>;
  updateBookStatus(bookId: number, status: BookStatus): Promise<void>;
  triggerOcr(bookId: number): Promise<void>;
  getBookFileUrl(bookId: number, version?: string | null): string;
}

