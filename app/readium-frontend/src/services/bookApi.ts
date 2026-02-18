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

const apiUrl = (path: string) => `/api${path}`;

interface UploadBookOptions {
  onProgress?: (progressPercent: number) => void;
}

export const bookApi = {
  getBooks: async (status?: StatusFilter, page = 0, size = 12, query?: string): Promise<BookPage> => {
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

    const response = await httpClient.get<BookPage>('/books', { params });

    if (response.status >= 400) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    return PaginatedBookResponseSchema.parse(response.data);
  },

  getBook: async (bookId: number): Promise<Book> => {
    const response = await httpClient.get<Book>(`/books/${bookId}`);
    if (response.status >= 400) throw new Error(`Erro ao buscar livro: ${response.status}`);
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
    if (response.status >= 400) throw new Error(`Erro ao fazer upload: ${response.status}`);
    return BookSchema.parse(response.data);
  },

  updateBookStatus: async (bookId: number, status: BookStatus): Promise<void> => {
    const response = await httpClient.patch('/books/status', { bookId, status });
    if (response.status >= 400) throw new Error(`Erro ao atualizar status: ${response.status}`);
  },

  updateProgress: async (bookId: number, page: number, keepalive = false): Promise<void> => {
    const response = await httpClient.patch(`/books/${bookId}/progress`, { page }, { keepalive });
    if (response.status >= 400) throw new Error(`Erro ao atualizar progresso: ${response.status}`);
  },

  triggerOcr: async (bookId: number): Promise<void> => {
    const response = await httpClient.post(`/books/${bookId}/ocr`);
    if (response.status >= 400) throw new Error(`Erro ao iniciar OCR: ${response.status}`);
  },

  getOcrStatus: async (bookId: number): Promise<BookOcrStatusResponse> => {
    const response = await httpClient.get<BookOcrStatusResponse>(`/books/${bookId}/ocr-status`);
    if (response.status >= 400) throw new Error(`Erro ao buscar status OCR: ${response.status}`);
    return BookOcrStatusResponseSchema.parse(response.data);
  },

  getTextLayerQuality: async (bookId: number): Promise<BookTextLayerQualityResponse> => {
    const response = await httpClient.get<BookTextLayerQualityResponse>(`/books/${bookId}/text-layer-quality`);
    if (response.status >= 400) throw new Error(`Erro ao buscar qualidade de texto: ${response.status}`);
    return BookTextLayerQualityResponseSchema.parse(response.data);
  },

  getBookFileUrl: (bookId: number, version?: string | null): string => {
    const base = apiUrl(`/books/${bookId}/file`);
    if (!version) {
      return base;
    }
    return `${base}?v=${encodeURIComponent(version)}`;
  },
  getBookCoverUrl: (bookId: number): string => apiUrl(`/books/${bookId}/cover`),
};

export const getBooks = bookApi.getBooks;
export const getBook = bookApi.getBook;
export const uploadBook = bookApi.uploadBook;
export const updateBookStatus = bookApi.updateBookStatus;
export const updateProgress = bookApi.updateProgress;
export const triggerOcr = bookApi.triggerOcr;
export const getOcrStatus = bookApi.getOcrStatus;
export const getTextLayerQuality = bookApi.getTextLayerQuality;
export const getBookFileUrl = bookApi.getBookFileUrl;
export const getBookCoverUrl = bookApi.getBookCoverUrl;
