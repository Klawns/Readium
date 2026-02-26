import { httpClient } from './http';
import type {
  Book,
  BookStatus,
  StatusFilter,
  BookPage,
  BookOcrStatusResponse,
  BookTextLayerQualityResponse,
} from '@/types';
import {
  PaginatedBookResponseSchema,
  BookSchema,
  BookOcrStatusResponseSchema,
  BookTextLayerQualityResponseSchema,
} from './schemas.ts';
import { toApiUrl } from './http/api-base-url.ts';

const apiUrl = (path: string) => toApiUrl(path);

interface UploadBookOptions {
  onProgress?: (progressPercent: number) => void;
}

interface UpdateProgressOptions {
  keepalive?: boolean;
  operationId?: string;
  mode?: 'MAX' | 'EXACT';
}

interface UpdateBookStatusOptions {
  operationId?: string;
}

const assertSuccess = (status: number, fallbackMessage: string) => {
  if (status >= 400) {
    throw new Error(`${fallbackMessage}: ${status}`);
  }
};

const buildBookQueryParams = (
  status?: StatusFilter,
  page = 0,
  size = 12,
  query?: string,
  categoryId?: number | null,
  collectionId?: number | null,
): Record<string, string> => {
  const params: Record<string, string> = {
    page: page.toString(),
    size: size.toString(),
  };

  if (status && status !== 'ALL') {
    params.status = status;
  }

  if (query && query.trim()) {
    params.query = query.trim();
  }

  if (typeof categoryId === 'number' && Number.isFinite(categoryId) && categoryId > 0) {
    params.categoryId = categoryId.toString();
  }

  if (typeof collectionId === 'number' && Number.isFinite(collectionId) && collectionId > 0) {
    params.collectionId = collectionId.toString();
  }

  return params;
};

const normalizeProgressOptions = (
  keepaliveOrOptions: boolean | UpdateProgressOptions,
): Required<Pick<UpdateProgressOptions, 'keepalive'>> & UpdateProgressOptions => {
  if (typeof keepaliveOrOptions === 'boolean') {
    return { keepalive: keepaliveOrOptions };
  }

  return {
    keepalive: keepaliveOrOptions.keepalive ?? false,
    operationId: keepaliveOrOptions.operationId,
    mode: keepaliveOrOptions.mode,
  };
};

export const bookApi = {
  getBooks: async (
    status?: StatusFilter,
    page = 0,
    size = 12,
    query?: string,
    categoryId?: number | null,
    collectionId?: number | null,
  ): Promise<BookPage> => {
    const response = await httpClient.get<BookPage>('/books', {
      params: buildBookQueryParams(status, page, size, query, categoryId, collectionId),
    });

    assertSuccess(response.status, 'Erro na API');
    return PaginatedBookResponseSchema.parse(response.data);
  },

  getBook: async (bookId: number): Promise<Book> => {
    const response = await httpClient.get<Book>(`/books/${bookId}`);
    assertSuccess(response.status, 'Erro ao buscar livro');
    return BookSchema.parse(response.data);
  },

  uploadBook: async (file: File, options?: UploadBookOptions): Promise<Book> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<Book>('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: options?.onProgress,
    });

    assertSuccess(response.status, 'Erro ao fazer upload');
    return BookSchema.parse(response.data);
  },

  updateBookStatus: async (
    bookId: number,
    status: BookStatus,
    options?: UpdateBookStatusOptions,
  ): Promise<void> => {
    const response = await httpClient.patch('/books/status', { bookId, status }, {
      headers: options?.operationId ? { 'X-Operation-Id': options.operationId } : undefined,
    });

    assertSuccess(response.status, 'Erro ao atualizar status');
  },

  updateProgress: async (
    bookId: number,
    page: number,
    keepaliveOrOptions: boolean | UpdateProgressOptions = false,
  ): Promise<void> => {
    const options = normalizeProgressOptions(keepaliveOrOptions);
    const payload = options.mode ? { page, mode: options.mode } : { page };

    const response = await httpClient.patch(
      `/books/${bookId}/progress`,
      payload,
      {
        keepalive: options.keepalive,
        headers: options.operationId ? { 'X-Operation-Id': options.operationId } : undefined,
      },
    );

    assertSuccess(response.status, 'Erro ao atualizar progresso');
  },

  deleteBook: async (bookId: number): Promise<void> => {
    const response = await httpClient.delete(`/books/${bookId}`);
    assertSuccess(response.status, 'Erro ao remover livro');
  },

  triggerOcr: async (bookId: number): Promise<void> => {
    const response = await httpClient.post(`/books/${bookId}/ocr`);
    assertSuccess(response.status, 'Erro ao iniciar OCR');
  },

  getOcrStatus: async (bookId: number): Promise<BookOcrStatusResponse> => {
    const response = await httpClient.get<BookOcrStatusResponse>(`/books/${bookId}/ocr-status`);
    assertSuccess(response.status, 'Erro ao buscar status OCR');
    return BookOcrStatusResponseSchema.parse(response.data);
  },

  getTextLayerQuality: async (bookId: number): Promise<BookTextLayerQualityResponse> => {
    const response = await httpClient.get<BookTextLayerQualityResponse>(`/books/${bookId}/text-layer-quality`);
    assertSuccess(response.status, 'Erro ao buscar qualidade de texto');
    return BookTextLayerQualityResponseSchema.parse(response.data);
  },

  getBookFileUrl: (bookId: number, version?: string | null): string => {
    const base = apiUrl(`/books/${bookId}/file`);
    if (!version) {
      return base;
    }
    return `${base}?v=${encodeURIComponent(version)}`;
  },
};

export const getBooks = bookApi.getBooks;
export const getBook = bookApi.getBook;
export const uploadBook = bookApi.uploadBook;
export const updateBookStatus = bookApi.updateBookStatus;
export const updateProgress = bookApi.updateProgress;
export const deleteBook = bookApi.deleteBook;
export const triggerOcr = bookApi.triggerOcr;
export const getOcrStatus = bookApi.getOcrStatus;
export const getTextLayerQuality = bookApi.getTextLayerQuality;
export const getBookFileUrl = bookApi.getBookFileUrl;
