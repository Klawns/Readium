import { z } from 'zod';
import { toApiAssetUrl } from './http/api-base-url.ts';

export const BookStatusSchema = z.enum(['TO_READ', 'READING', 'READ']);
export const OcrStatusSchema = z.enum(['PENDING', 'RUNNING', 'DONE', 'FAILED']);
export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  color: z.string(),
  parentId: z.number().nullable().optional(),
  sortOrder: z.number(),
  booksCount: z.number(),
});
export const CategoryListSchema = z.array(CategorySchema);

export const ReadingCollectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  color: z.string(),
  icon: z.string(),
  sortOrder: z.number(),
  templateId: z.string(),
  booksCount: z.number(),
});

export const ReadingCollectionListSchema = z.array(ReadingCollectionSchema);

export const BookSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string().nullable(),
  pages: z.number().nullable(),
  format: z.enum(['PDF', 'EPUB']),
  status: BookStatusSchema,
  coverUrl: z.string().nullable().transform((url) => toApiAssetUrl(url)),
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
  details: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const BookTextLayerQualityResponseSchema = z.object({
  bookId: z.number(),
  score: z.number().nullable().optional(),
  status: OcrStatusSchema,
  updatedAt: z.string().nullable().optional(),
});

export const BookMetricsSchema = z.object({
  totalBooks: z.number(),
  toReadBooks: z.number(),
  readingBooks: z.number(),
  readBooks: z.number(),
  categorizedBooks: z.number(),
  uncategorizedBooks: z.number(),
  totalPagesKnown: z.number(),
  pagesRead: z.number(),
  averageProgressPercent: z.number(),
  completionPercent: z.number(),
});

export const SmartCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  totalBooks: z.number(),
  previewBooks: z.array(BookSchema),
});

export const SmartCollectionListSchema = z.array(SmartCollectionSchema);

export const BookRecommendationSchema = z.object({
  book: BookSchema,
  reason: z.string(),
  score: z.number(),
});

export const BookRecommendationListSchema = z.array(BookRecommendationSchema);

export const ReadingEvolutionPointSchema = z.object({
  date: z.string(),
  pagesRead: z.number(),
  booksTouched: z.number(),
  progressUpdates: z.number(),
});

export const ReadingEvolutionPointListSchema = z.array(ReadingEvolutionPointSchema);

