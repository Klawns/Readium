import { z } from 'zod';

export const BookStatusSchema = z.enum(['TO_READ', 'READING', 'READ']);
export const OcrStatusSchema = z.enum(['PENDING', 'RUNNING', 'DONE', 'FAILED']);

export const BookSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string().nullable(),
  pages: z.number().nullable(),
  format: z.enum(['PDF', 'EPUB']),
  status: BookStatusSchema,
  coverUrl: z.string().nullable().transform(url => {
    // Se a URL vier absoluta do backend (ex: http://localhost:8080/...),
    // transformamos em relativa (/api/...) para passar pelo proxy.
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      // Se for uma URL completa, pegamos apenas o pathname e adicionamos /api se necessário
      // O backend pode retornar /books/1/cover ou http://.../books/1/cover
      // Se o backend já retornar relativo, new URL falha (o que é bom, cai no catch)
      
      // Assumindo que o backend retorna /books/... ou http://.../books/...
      // Queremos que fique /api/books/...
      
      // Se o pathname já começar com /api, mantemos.
      if (urlObj.pathname.startsWith('/api')) return urlObj.pathname;
      
      // Se não, adicionamos /api
      return `/api${urlObj.pathname}`;
    } catch (e) {
      // Se não for URL válida (já é relativa), apenas garantimos o prefixo /api
      if (url.startsWith('http')) return url; // Fallback se algo der errado
      if (url.startsWith('/api')) return url;
      return `/api${url.startsWith('/') ? '' : '/'}${url}`;
    }
  }),
  lastReadPage: z.number().nullable().optional(), // Novo campo opcional
});

// Schema para resposta paginada do Spring Boot
export const PaginatedBookResponseSchema = z.object({
  content: z.array(BookSchema),
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  number: z.number(),
  first: z.boolean(),
  last: z.boolean(),
  empty: z.boolean(),
});

export const RectSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

const RectsSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}, z.array(RectSchema));

export const AnnotationSchema = z.object({
  id: z.number(),
  bookId: z.number(),
  page: z.number(),
  rects: RectsSchema,
  color: z.string(),
  selectedText: z.string(),
  note: z.string().nullable().optional(),
});

// Schema for data coming from the backend, which might have a nested book object
const BackendAnnotationSchema = z.object({
  id: z.number(),
  page: z.number(),
  rects: RectsSchema,
  color: z.string(),
  selectedText: z.string(),
  note: z.string().nullable().optional(),
  // Handle nested book object or primitive bookId
  book: z.object({ id: z.number() }).optional(),
  bookId: z.number().optional(),
}).transform((data) => {
  const { book, bookId, ...rest } = data;
  return {
    ...rest,
    bookId: book?.id ?? bookId ?? -1, // Fallback to -1 if neither is present
  };
}).pipe(AnnotationSchema); // Pipe to the final schema to ensure it's correct

export const AnnotationResponseSchema = z.array(BackendAnnotationSchema);

export const TranslationSchema = z.object({
  id: z.number(),
  bookId: z.number().nullable(),
  originalText: z.string(),
  translatedText: z.string(),
  contextSentence: z.string().nullable().optional(),
});

export const AutoTranslationResponseSchema = z.object({
  translatedText: z.string(),
  detectedLanguage: z.string(),
});

export const BookOcrStatusResponseSchema = z.object({
  bookId: z.number(),
  status: OcrStatusSchema,
  score: z.number().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const BookTextLayerQualityResponseSchema = z.object({
  bookId: z.number(),
  score: z.number().nullable().optional(),
  status: OcrStatusSchema,
  updatedAt: z.string().nullable().optional(),
});
