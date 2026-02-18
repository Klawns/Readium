export interface SaveReaderProgressCommand {
  bookId: number;
  page: number;
  keepalive?: boolean;
}

export interface ReaderProgressRepository {
  saveProgress(command: SaveReaderProgressCommand): Promise<void>;
}
