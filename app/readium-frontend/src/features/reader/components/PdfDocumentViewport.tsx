import React from 'react';
import { Loader2 } from 'lucide-react';
import { EmbedPDF } from '@embedpdf/core/react';
import type { PdfDocumentViewportProps } from '../ui/hooks/pdf-viewport/PdfDocumentViewport.types';
import { PdfViewportStateBridge } from './PdfViewportStateBridge';
import { PdfDocumentViewportContent } from './PdfDocumentViewportContent';
import { usePdfViewportDocumentLoader } from '../ui/hooks/pdf-viewport/usePdfViewportDocumentLoader';
import { usePdfViewportTouchAction } from '../ui/hooks/pdf-viewport/usePdfViewportTouchAction';
import { usePdfViewportPageData } from '../ui/hooks/pdf-viewport/usePdfViewportPageData';
import { usePdfViewportInteractionController } from '../ui/hooks/pdf-viewport/usePdfViewportInteractionController';
import { usePdfViewportCapabilities } from '../ui/hooks/pdf-viewport/usePdfViewportCapabilities';
import { usePdfViewportActiveDocumentDebug } from '../ui/hooks/pdf-viewport/usePdfViewportActiveDocumentDebug';
import { pdfViewportPluginRegistrations } from '../ui/hooks/pdf-viewport/pdfViewport.plugins';

const PdfDocumentViewportInner: React.FC<PdfDocumentViewportProps> = ({
  engine,
  fileUrl,
  containerRef,
  pendingSelection,
  annotations,
  translationOverlays,
  initialPage,
  currentZoomLevel,
  isTouchSelectionModeEnabled = false,
  onSelectionResolved,
  onTranslationOverlayInteract,
  onAnnotationOverlayInteract,
  onViewportStateChange,
  onViewportActionsReady,
  onTextLayerQualityEvaluated,
  onViewportTap,
  onTouchPointerActiveChange,
}) => {
  const {
    documentManager,
    activeDocumentId,
    activeDocument,
    selectionCapability,
    annotationCapability,
    scrollCapability,
    interactionCapability,
  } = usePdfViewportCapabilities();

  const { annotationsByPage, translationOverlaysByPage, annotationIdsWithTranslation } = usePdfViewportPageData({
    annotations,
    translationOverlays,
  });

  usePdfViewportActiveDocumentDebug({
    activeDocumentId,
    activeDocument,
    overlaysCount: translationOverlays.length,
    annotationsCount: annotations.length,
  });

  usePdfViewportDocumentLoader({
    documentManager,
    fileUrl,
    activeDocumentId,
    onViewportActionsReady,
    onViewportStateChange,
  });

  const interactionBindings = usePdfViewportInteractionController({
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
  });
  React.useEffect(() => {
    onTouchPointerActiveChange?.(interactionBindings.isTouchPointerActive);
  }, [interactionBindings.isTouchPointerActive, onTouchPointerActiveChange]);
  const touchAction = usePdfViewportTouchAction({
    currentZoomLevel,
    isTouchSelectionLocked: interactionBindings.isTouchSelectionLocked,
  });

  if (!activeDocumentId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PdfViewportStateBridge
        activeDocumentId={activeDocumentId}
        initialPage={initialPage}
        onViewportStateChange={onViewportStateChange}
        onViewportActionsReady={onViewportActionsReady}
      />
      <PdfDocumentViewportContent
        activeDocumentId={activeDocumentId}
        touchAction={touchAction}
        pendingSelection={pendingSelection}
        annotationsByPage={annotationsByPage}
        translationOverlaysByPage={translationOverlaysByPage}
        interactionBindings={interactionBindings}
        onTranslationOverlayInteract={onTranslationOverlayInteract}
        onAnnotationOverlayInteract={onAnnotationOverlayInteract}
      />
    </>
  );
};

export const PdfDocumentViewport: React.FC<PdfDocumentViewportProps> = (props) => (
  <EmbedPDF engine={props.engine} plugins={pdfViewportPluginRegistrations}>
    <PdfDocumentViewportInner {...props} />
  </EmbedPDF>
);
