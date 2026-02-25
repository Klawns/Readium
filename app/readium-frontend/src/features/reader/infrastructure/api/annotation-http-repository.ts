import { httpClient } from '@/services/http';
import { AnnotationResponseSchema } from '@/services/schemas';
import type {
  AnnotationRepository,
  CreateAnnotationCommand,
  UpdateAnnotationCommand,
} from '../../domain/ports/AnnotationRepository';
import type { ReaderAnnotation } from '../../domain/models';
import type { HttpResponse } from '@/services/http/types.ts';

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

export class AnnotationHttpStatusError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AnnotationHttpStatusError';
  }
}

export const isAnnotationHttpStatusError = (error: unknown): error is AnnotationHttpStatusError =>
  error instanceof AnnotationHttpStatusError;

const ensureSuccessStatus = (response: HttpResponse, action: string): void => {
  if (response.status >= 400) {
    throw new AnnotationHttpStatusError(`Falha ao ${action} anotacao (HTTP ${response.status}).`, response.status);
  }
};

export class AnnotationHttpRepository implements AnnotationRepository {
  private operationHeaders(operationId?: string): Record<string, string> | undefined {
    if (!operationId) {
      return undefined;
    }
    return { 'X-Operation-Id': operationId };
  }

  async getByBook(bookId: number): Promise<ReaderAnnotation[]> {
    const response = await httpClient.get(`/books/${bookId}/annotations`, {
      params: { resultPage: 0, size: 500 },
    });
    ensureSuccessStatus(response, 'listar');
    const parsed = AnnotationResponseSchema.parse(response.data) as AnnotationDto[];
    return parsed.map(toReaderAnnotation);
  }

  async getByBookAndPage(bookId: number, page: number): Promise<ReaderAnnotation[]> {
    const response = await httpClient.get(`/annotations/book/${bookId}/page/${page}`, {
      params: { resultPage: 0, size: 500 },
    });
    ensureSuccessStatus(response, 'listar');
    const parsed = AnnotationResponseSchema.parse(response.data) as AnnotationDto[];
    return parsed.map(toReaderAnnotation);
  }

  async create(command: CreateAnnotationCommand): Promise<ReaderAnnotation> {
    return this.createWithOperationId(command);
  }

  async createWithOperationId(command: CreateAnnotationCommand, operationId?: string): Promise<ReaderAnnotation> {
    const response = await httpClient.post('/annotations', command, {
      headers: this.operationHeaders(operationId),
    });
    ensureSuccessStatus(response, 'criar');
    const parsed = AnnotationResponseSchema.element.parse(response.data) as AnnotationDto;
    return toReaderAnnotation(parsed);
  }

  async update(command: UpdateAnnotationCommand): Promise<ReaderAnnotation> {
    return this.updateWithOperationId(command);
  }

  async updateWithOperationId(command: UpdateAnnotationCommand, operationId?: string): Promise<ReaderAnnotation> {
    const response = await httpClient.put(
      `/annotations/${command.id}`,
      {
        color: command.color,
        note: command.note,
      },
      {
        headers: this.operationHeaders(operationId),
      },
    );
    ensureSuccessStatus(response, 'atualizar');
    const parsed = AnnotationResponseSchema.element.parse(response.data) as AnnotationDto;
    return toReaderAnnotation(parsed);
  }

  async delete(id: number): Promise<void> {
    await this.deleteWithOperationId(id);
  }

  async deleteWithOperationId(id: number, operationId?: string): Promise<void> {
    const response = await httpClient.delete(`/annotations/${id}`, {
      headers: this.operationHeaders(operationId),
    });
    ensureSuccessStatus(response, 'remover');
  }
}
