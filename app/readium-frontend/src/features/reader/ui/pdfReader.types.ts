import type { BookStatus, OcrStatus, Translation } from '@/types';
import type { ReaderRect } from '../domain/models';

export interface PdfReaderProps {
  fileUrl: string;
  bookId: number;
  initialPage?: number;
  bookStatus?: BookStatus;
  onStatusChange?: (status: BookStatus) => void;
  totalPages?: number;
  ocrStatus?: OcrStatus;
  ocrScore?: number | null;
  onTriggerOcr?: () => void;
  isTriggeringOcr?: boolean;
}

export interface TranslationInputState {
  position: { x: number; y: number };
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  googleTranslateUrl?: string;
  page: number;
  rects: ReaderRect[];
}

export interface ActiveTranslationState {
  translation: Translation;
  position: { x: number; y: number };
}
