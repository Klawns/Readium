import type { PdfEngine } from '@embedpdf/models';
import type { ReaderAnnotation } from '../../../domain/models';
import type {
  PendingSelection,
  ReaderTranslationOverlay,
  ReaderViewportActions,
  ReaderViewportState,
} from '../../readerTypes';

export interface TranslationOverlayInteractPayload {
  translation: ReaderTranslationOverlay['translation'];
  position: { x: number; y: number };
}

export interface PdfDocumentViewportProps {
  engine: PdfEngine;
  fileUrl: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  annotations: ReaderAnnotation[];
  translationOverlays: ReaderTranslationOverlay[];
  initialPage: number;
  onSelectionResolved: (selection: PendingSelection | null) => void;
  onTranslationOverlayInteract?: (payload: TranslationOverlayInteractPayload) => void;
  onViewportStateChange?: (state: ReaderViewportState) => void;
  onViewportActionsReady?: (actions: ReaderViewportActions | null) => void;
  onTextLayerQualityEvaluated?: (lowTextLayerQuality: boolean) => void;
  onViewportTap?: (payload: { x: number; y: number }) => void;
}
