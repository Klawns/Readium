import type {
  Book,
  BookOcrStatusResponse,
  BookStatus,
  BookTextLayerQualityResponse,
} from '@/types';
import { getOfflineBookDownload } from '@/features/offline/application/services/offline-book-download-service';
import { getOfflineBookSnapshot } from '@/features/offline/application/services/offline-book-snapshot-service';
import { updateBookStatusOfflineFirst } from '@/features/offline/application/services/offline-book-status-sync-service';
import type { ReaderBookRepository } from '../../domain/ports/ReaderBookRepository';

const FALLBACK_READER_STATUS: BookStatus = 'TO_READ';

const buildLocalBook = async (bookId: number): Promise<Book | null> => {
  const [snapshot, download] = await Promise.all([
    getOfflineBookSnapshot(bookId),
    getOfflineBookDownload(bookId),
  ]);

  if (!snapshot && !download) {
    return null;
  }

  return {
    id: bookId,
    title: snapshot?.title ?? download?.title ?? `Livro ${bookId}`,
    author: snapshot?.author ?? download?.author ?? null,
    pages: snapshot?.pages ?? download?.pages ?? null,
    format: download ? 'PDF' : (snapshot?.format ?? 'PDF'),
    status: snapshot?.status ?? FALLBACK_READER_STATUS,
    coverUrl: snapshot?.coverUrl ?? null,
    lastReadPage: snapshot?.lastReadPage ?? null,
  };
};

const buildLocalOcrStatus = (bookId: number): BookOcrStatusResponse => ({
  bookId,
  status: 'DONE',
  score: null,
  details: 'OCR indisponivel no modo local.',
  updatedAt: null,
});

export class ReaderBookLocalRepository implements ReaderBookRepository {
  async getBook(bookId: number): Promise<Book> {
    const localBook = await buildLocalBook(bookId);
    if (!localBook) {
      throw new Error('Livro nao encontrado no armazenamento local.');
    }
    return localBook;
  }

  async getOcrStatus(bookId: number): Promise<BookOcrStatusResponse> {
    return buildLocalOcrStatus(bookId);
  }

  async getTextLayerQuality(bookId: number): Promise<BookTextLayerQualityResponse> {
    return {
      bookId,
      score: null,
      status: 'DONE',
      updatedAt: null,
    };
  }

  async updateBookStatus(bookId: number, status: BookStatus): Promise<void> {
    await updateBookStatusOfflineFirst({ bookId, status });
  }

  async triggerOcr(): Promise<void> {
    throw new Error('OCR indisponivel no modo local.');
  }

  getBookFileUrl(): string {
    return '';
  }
}
