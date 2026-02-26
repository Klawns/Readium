export type ReaderProgressUpdateMode = 'MAX' | 'EXACT';

export interface SaveReaderProgressCommand {
  bookId: number;
  page: number;
  keepalive?: boolean;
  mode?: ReaderProgressUpdateMode;
}

export interface ReaderProgressRepository {
  saveProgress(command: SaveReaderProgressCommand): Promise<void>;
}
