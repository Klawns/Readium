import type { ReaderRect } from '../domain/models';

export interface PendingSelection {
  text: string;
  page: number;
  rects: ReaderRect[];
  popupPosition: { x: number; y: number };
}

export interface ReaderViewportState {
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
}

export interface ReaderViewportActions {
  goToPage: (page: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}
