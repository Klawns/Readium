import { httpClient } from '@/services/http';
import { AnnotationResponseSchema } from '@/services/schemas';
import type {
  AnnotationRepository,
  CreateAnnotationCommand,
  UpdateAnnotationCommand,
} from '../../domain/ports/AnnotationRepository';
import type { ReaderAnnotation } from '../../domain/models';

type AnnotationDto = {
  id: number;
  bookId: number;
  page: number;
  rects: ReaderAnnotation['rects'];
  color: string;
  selectedText: string;
  note?: string | null;
};

const toReaderAnnotation = (annotation: AnnotationDto): ReaderAnnotation => ({
  id: annotation.id,
  bookId: annotation.bookId,
  page: annotation.page,
  rects: annotation.rects.map((rect) => ({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  })),
  color: annotation.color,
  selectedText: annotation.selectedText,
  note: annotation.note ?? null,
});

export class AnnotationHttpRepository implements AnnotationRepository {
  async getByBook(bookId: number): Promise<ReaderAnnotation[]> {
    const response = await httpClient.get(`/books/${bookId}/annotations`, {
      params: { resultPage: 0, size: 500 },
    });
    const parsed = AnnotationResponseSchema.parse(response.data) as AnnotationDto[];
    return parsed.map(toReaderAnnotation);
  }

  async getByBookAndPage(bookId: number, page: number): Promise<ReaderAnnotation[]> {
    const response = await httpClient.get(`/annotations/book/${bookId}/page/${page}`, {
      params: { resultPage: 0, size: 500 },
    });
    const parsed = AnnotationResponseSchema.parse(response.data) as AnnotationDto[];
    return parsed.map(toReaderAnnotation);
  }

  async create(command: CreateAnnotationCommand): Promise<ReaderAnnotation> {
    const response = await httpClient.post('/annotations', command);
    const parsed = AnnotationResponseSchema.element.parse(response.data) as AnnotationDto;
    return toReaderAnnotation(parsed);
  }

  async update(command: UpdateAnnotationCommand): Promise<ReaderAnnotation> {
    const response = await httpClient.put(`/annotations/${command.id}`, {
      color: command.color,
      note: command.note,
    });
    const parsed = AnnotationResponseSchema.element.parse(response.data) as AnnotationDto;
    return toReaderAnnotation(parsed);
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/annotations/${id}`);
  }
}
