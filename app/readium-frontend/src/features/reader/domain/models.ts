export interface ReaderRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReaderAnnotation {
  id: number;
  bookId: number;
  page: number;
  rects: ReaderRect[];
  color: string;
  selectedText: string;
  note?: string | null;
}

export interface ReaderTranslation {
  id: number;
  bookId: number | null;
  originalText: string;
  translatedText: string;
  contextSentence?: string;
}

export interface SelectionRange {
  page: number;
  rects: ReaderRect[];
  text: string;
}
