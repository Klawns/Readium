import type { SaveReadingCollectionCommand } from './ports/ReadingCollectionRepository';

export interface CreateReadingCollectionAction extends SaveReadingCollectionCommand {
  initialBookIds?: number[];
}

export interface UpdateReadingCollectionAction {
  collectionId: number;
  command: SaveReadingCollectionCommand;
}

export interface MoveReadingCollectionAction {
  collectionId: number;
  targetIndex: number;
}

export type BookCollectionDropTarget = number | 'unassigned';
export type CollectionDropTarget = BookCollectionDropTarget | null;
