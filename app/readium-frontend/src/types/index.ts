import { z } from 'zod';
import { 
  BookSchema, 
  BookStatusSchema, 
  OcrStatusSchema,
  RectSchema, 
  AnnotationSchema, 
  TranslationSchema,
  PaginatedBookResponseSchema,
  BookOcrStatusResponseSchema,
  BookTextLayerQualityResponseSchema,
} from '@/services/schemas.ts';

// Derivando tipos dos schemas Zod para garantir Single Source of Truth
export type BookStatus = z.infer<typeof BookStatusSchema>;
export type OcrStatus = z.infer<typeof OcrStatusSchema>;
export type Book = z.infer<typeof BookSchema>;
export type Rect = z.infer<typeof RectSchema>;
export type Annotation = z.infer<typeof AnnotationSchema>;
export type Translation = z.infer<typeof TranslationSchema>;
export type BookOcrStatusResponse = z.infer<typeof BookOcrStatusResponseSchema>;
export type BookTextLayerQualityResponse = z.infer<typeof BookTextLayerQualityResponseSchema>;

// Derivando Page<Book> do schema para garantir compatibilidade
export type BookPage = z.infer<typeof PaginatedBookResponseSchema>;

// Mantendo interface genérica para outros usos, se necessário
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type StatusFilter = 'ALL' | BookStatus;
