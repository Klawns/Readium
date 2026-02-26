import type {
  ReaderProgressRepository,
  SaveReaderProgressCommand,
} from '../../domain/ports/ReaderProgressRepository';
import { saveProgressOfflineFirst } from '@/features/offline/application/services/offline-progress-sync-service';

export class ReaderProgressOfflineRepository implements ReaderProgressRepository {
  async saveProgress(command: SaveReaderProgressCommand): Promise<void> {
    await saveProgressOfflineFirst({
      bookId: command.bookId,
      page: command.page,
      keepalive: command.keepalive ?? false,
      mode: command.mode ?? 'MAX',
    });
  }
}
