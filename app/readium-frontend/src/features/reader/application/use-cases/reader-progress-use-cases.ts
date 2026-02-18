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
