import type { ReaderAnnotation, ReaderRect } from '../models';

export interface CreateAnnotationCommand {
  bookId: number;
  page: number;
  color: string;
  selectedText: string;
  note?: string;
  rects: ReaderRect[];
}

export interface UpdateAnnotationCommand {
  id: number;
  color?: string;
  note?: string;
}

export interface AnnotationRepository {
  getByBook(bookId: number): Promise<ReaderAnnotation[]>;
  getByBookAndPage(bookId: number, page: number): Promise<ReaderAnnotation[]>;
  create(command: CreateAnnotationCommand): Promise<ReaderAnnotation>;
  update(command: UpdateAnnotationCommand): Promise<ReaderAnnotation>;
  delete(id: number): Promise<void>;
}
