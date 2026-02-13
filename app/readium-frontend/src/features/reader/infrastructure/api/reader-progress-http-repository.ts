import { bookApi } from '@/services/bookApi';
import type {
  ReaderProgressRepository,
  SaveReaderProgressCommand,
} from '../../domain/ports/ReaderProgressRepository';

export class ReaderProgressHttpRepository implements ReaderProgressRepository {
  async saveProgress(command: SaveReaderProgressCommand): Promise<void> {
    await bookApi.updateProgress(command.bookId, command.page, command.keepalive ?? false);
  }

  async getLastReadPage(bookId: number): Promise<number | null> {
    const book = await bookApi.getBook(bookId);
    return book.lastReadPage ?? null;
  }
}
