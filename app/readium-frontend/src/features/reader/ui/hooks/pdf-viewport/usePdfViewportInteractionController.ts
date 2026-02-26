import type { DocumentState } from '@embedpdf/core';
import type { PdfEngine } from '@embedpdf/models';
import type { AnnotationCapability } from '@embedpdf/plugin-annotation/react';
import type { InteractionManagerCapability } from '@embedpdf/plugin-interaction-manager/react';
import type { ScrollCapability } from '@embedpdf/plugin-scroll/react';
import type { SelectionCapability } from '@embedpdf/plugin-selection/react';
import type { ReaderAnnotation } from '../../../domain/models';
import type { PendingSelection } from '../../readerTypes';
import { usePdfViewportTouchInteractions } from './usePdfViewportTouchInteractions';
import { usePdfViewportSelection } from './usePdfViewportSelection';
import { usePdfViewportTextLayerQuality } from './usePdfViewportTextLayerQuality';
import { usePdfViewportAnnotationSync } from './usePdfViewportAnnotationSync';
import { usePdfViewportLinkNavigation } from './usePdfViewportLinkNavigation';

export interface PdfViewportInteractionBindings {
  showTouchSelectionRects: boolean;
  isTouchSelectionLocked: boolean;
  isTouchPointerActive: boolean;
  preventNativeDrag: (event: React.DragEvent) => void;
  preventMobileContextMenu: (event: React.MouseEvent) => void;
  handlePointerDownCapture: (event: React.PointerEvent) => void;
  handlePointerMoveCapture: (event: React.PointerEvent) => void;
  handlePointerEndCapture: (event: React.PointerEvent) => void;
}

interface UsePdfViewportInteractionControllerParams {
  engine: PdfEngine;
  activeDocumentId?: string;
  activeDocument: DocumentState | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  annotations: ReaderAnnotation[];
  annotationIdsWithTranslation: Set<number>;
  interactionCapability: Readonly<InteractionManagerCapability> | null;
  selectionCapability: Readonly<SelectionCapability> | null;
  annotationCapability: Readonly<AnnotationCapability> | null;
  scrollCapability: Readonly<ScrollCapability> | null;
  isTouchSelectionModeEnabled: boolean;
  onSelectionResolved: (selection: PendingSelection | null) => void;
  onTextLayerQualityEvaluated?: (lowTextLayerQuality: boolean) => void;
  onViewportTap?: (payload: { x: number; y: number }) => void;
}

export const usePdfViewportInteractionController = ({
  engine,
  activeDocumentId,
  activeDocument,
  containerRef,
  annotations,
  annotationIdsWithTranslation,
  interactionCapability,
  selectionCapability,
  annotationCapability,
  scrollCapability,
  isTouchSelectionModeEnabled,
  onSelectionResolved,
  onTextLayerQualityEvaluated,
  onViewportTap,
}: UsePdfViewportInteractionControllerParams): PdfViewportInteractionBindings => {
  const touchInteractions = usePdfViewportTouchInteractions({
    activeDocumentId,
    interactionCapability,
    selectionCapability,
    isTouchSelectionModeEnabled,
    onViewportTap,
  });

  usePdfViewportSelection({
    selectionCapability,
    activeDocumentId,
    activeDocument,
    containerRef,
    onSelectionResolved,
    lastPointerTypeRef: touchInteractions.lastPointerTypeRef,
    lastTouchSelectionAllowedRef: touchInteractions.lastTouchSelectionAllowedRef,
    touchPointerEndSignal: touchInteractions.touchPointerEndSignal,
  });

  usePdfViewportTextLayerQuality({
    engine,
    activeDocumentId,
    activeDocument,
    onTextLayerQualityEvaluated,
  });

  usePdfViewportAnnotationSync({
    annotationCapability,
    activeDocumentId,
    activeDocument,
    annotations,
    annotationIdsWithTranslation,
  });

  usePdfViewportLinkNavigation({
    annotationCapability,
    scrollCapability,
    activeDocumentId,
  });

  return {
    showTouchSelectionRects: touchInteractions.showTouchSelectionRects,
    isTouchSelectionLocked: touchInteractions.isTouchSelectionLocked,
    isTouchPointerActive: touchInteractions.isTouchPointerActive,
    preventNativeDrag: touchInteractions.preventNativeDrag,
    preventMobileContextMenu: touchInteractions.preventMobileContextMenu,
    handlePointerDownCapture: touchInteractions.handlePointerDownCapture,
    handlePointerMoveCapture: touchInteractions.handlePointerMoveCapture,
    handlePointerEndCapture: touchInteractions.handlePointerEndCapture,
  };
};
