import type {
  ReaderProgressRepository,
  SaveReaderProgressCommand,
} from '../../domain/ports/ReaderProgressRepository';

export class SaveReaderProgressUseCase {
  constructor(private readonly repository: ReaderProgressRepository) {}

  execute(command: SaveReaderProgressCommand) {
    return this.repository.saveProgress(command);
  }
}

export class GetLastReadPageUseCase {
  constructor(private readonly repository: ReaderProgressRepository) {}

  execute(bookId: number) {
    return this.repository.getLastReadPage(bookId);
  }
}
