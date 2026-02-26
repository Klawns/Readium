import React from 'react';
import type { PdfEngine } from '@embedpdf/models';
import type { ReaderAnnotation } from '../domain/models';
import type {
  PendingSelection,
  ReaderTranslationOverlay,
  ReaderViewportActions,
  ReaderViewportState,
} from '../ui/readerTypes';
import type {
  ActiveTranslationState,
  TranslationInputState,
} from '../ui/pdfReader.types';
import type {
  AnnotationOverlayInteractPayload,
  TranslationOverlayInteractPayload,
} from '../ui/hooks/pdf-viewport/PdfDocumentViewport.types';
import { PdfDocumentViewport } from './PdfDocumentViewport';
import ReaderControlsDock from './ReaderControlsDock';
import { ReaderTouchModeFab } from './ReaderTouchModeFab';
import ReaderAnnotationsSidebar from './ReaderAnnotationsSidebar';
import { ReaderInteractionOverlays } from './ReaderInteractionOverlays';
import { ReaderStatusIndicators } from './ReaderStatusIndicators';

interface ActiveAnnotationNoteState {
  annotation: ReaderAnnotation;
  position: { x: number; y: number };
}

interface ReaderViewportShellProps {
  engine: PdfEngine;
  fileUrl: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  readerChromeSpacingClass: string;
  annotations: ReaderAnnotation[];
  allAnnotations: ReaderAnnotation[];
  translationOverlays: ReaderTranslationOverlay[];
  initialPage: number;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  pendingSelection: PendingSelection | null;
  translationInput: TranslationInputState | null;
  activeTranslation: ActiveTranslationState | null;
  activeAnnotationNote: ActiveAnnotationNoteState | null;
  isSavingNote: boolean;
  isDeletingNote: boolean;
  isTranslating: boolean;
  isReaderLoading: boolean;
  isMobile: boolean;
  isReaderUiVisible: boolean;
  isTouchSelectionModeEnabled: boolean;
  isAnnotationsSidebarOpen: boolean;
  onSetAnnotationsSidebarOpen: (open: boolean) => void;
  onToggleTouchSelectionMode: () => void;
  onSelectionResolved: (selection: PendingSelection | null) => void;
  onTranslationOverlayInteract: (payload: TranslationOverlayInteractPayload) => void;
  onAnnotationOverlayInteract: (payload: AnnotationOverlayInteractPayload) => void;
  onViewportStateChange: (state: ReaderViewportState) => void;
  onViewportActionsReady: (actions: ReaderViewportActions | null) => void;
  onTextLayerQualityEvaluated: (lowTextLayerQuality: boolean) => void;
  onViewportTap: (payload: { x: number; y: number }) => void;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onGoToAnnotationPage: (page: number) => void;
  onSelectColor: (color: string) => void;
  onCopySelection: () => void;
  onStartTranslateFlow: () => void;
  onCloseSelection: () => void;
  onSaveTranslation: (value: string) => void;
  onCancelTranslation: () => void;
  onCloseActiveTranslation: () => void;
  onSaveAnnotationNote: (note: string) => void;
  onDeleteAnnotationNote: () => void;
  onCancelAnnotationNote: () => void;
}

export const ReaderViewportShell: React.FC<ReaderViewportShellProps> = ({
  engine,
  fileUrl,
  containerRef,
  readerChromeSpacingClass,
  annotations,
  allAnnotations,
  translationOverlays,
  initialPage,
  currentPage,
  totalPages,
  zoomLevel,
  pendingSelection,
  translationInput,
  activeTranslation,
  activeAnnotationNote,
  isSavingNote,
  isDeletingNote,
  isTranslating,
  isReaderLoading,
  isMobile,
  isReaderUiVisible,
  isTouchSelectionModeEnabled,
  isAnnotationsSidebarOpen,
  onSetAnnotationsSidebarOpen,
  onToggleTouchSelectionMode,
  onSelectionResolved,
  onTranslationOverlayInteract,
  onAnnotationOverlayInteract,
  onViewportStateChange,
  onViewportActionsReady,
  onTextLayerQualityEvaluated,
  onViewportTap,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onGoToAnnotationPage,
  onSelectColor,
  onCopySelection,
  onStartTranslateFlow,
  onCloseSelection,
  onSaveTranslation,
  onCancelTranslation,
  onCloseActiveTranslation,
  onSaveAnnotationNote,
  onDeleteAnnotationNote,
  onCancelAnnotationNote,
}) => {
  const [isTouchPointerActive, setIsTouchPointerActive] = React.useState(false);

  return (
    <div
      ref={containerRef}
      className={`reader-canvas-shell reader-motion-padding relative flex-1 overflow-hidden ${readerChromeSpacingClass}`}
    >
      <PdfDocumentViewport
        engine={engine}
        fileUrl={fileUrl}
        containerRef={containerRef}
        pendingSelection={pendingSelection}
        annotations={annotations}
        translationOverlays={translationOverlays}
        initialPage={initialPage}
        currentZoomLevel={zoomLevel}
        isTouchSelectionModeEnabled={isTouchSelectionModeEnabled}
        onSelectionResolved={onSelectionResolved}
        onTranslationOverlayInteract={onTranslationOverlayInteract}
        onAnnotationOverlayInteract={onAnnotationOverlayInteract}
        onViewportStateChange={onViewportStateChange}
        onViewportActionsReady={onViewportActionsReady}
        onTextLayerQualityEvaluated={onTextLayerQualityEvaluated}
        onViewportTap={isTouchSelectionModeEnabled ? undefined : onViewportTap}
        onTouchPointerActiveChange={setIsTouchPointerActive}
      />

      <ReaderControlsDock
        currentPage={currentPage}
        totalPages={totalPages}
        zoomLevel={zoomLevel}
        onPageChange={onPageChange}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
        isVisible={isReaderUiVisible}
      />
      {isMobile && (
        <ReaderTouchModeFab
          isTouchSelectionModeEnabled={isTouchSelectionModeEnabled}
          onToggleTouchSelectionMode={onToggleTouchSelectionMode}
        />
      )}

      <ReaderAnnotationsSidebar
        annotations={allAnnotations}
        currentPage={currentPage}
        isOpen={isAnnotationsSidebarOpen}
        isVisible={!isMobile || isReaderUiVisible}
        onOpenChange={onSetAnnotationsSidebarOpen}
        onGoToPage={onGoToAnnotationPage}
      />

      <ReaderInteractionOverlays
        pendingSelection={pendingSelection}
        isTouchPointerActive={isTouchPointerActive}
        translationInput={translationInput}
        activeTranslation={activeTranslation}
        activeAnnotationNote={activeAnnotationNote}
        isSavingNote={isSavingNote}
        isDeletingNote={isDeletingNote}
        onSelectColor={onSelectColor}
        onCopySelection={onCopySelection}
        onStartTranslateFlow={onStartTranslateFlow}
        onCloseSelection={onCloseSelection}
        onSaveTranslation={onSaveTranslation}
        onCancelTranslation={onCancelTranslation}
        onCloseActiveTranslation={onCloseActiveTranslation}
        onSaveAnnotationNote={onSaveAnnotationNote}
        onDeleteAnnotationNote={onDeleteAnnotationNote}
        onCancelAnnotationNote={onCancelAnnotationNote}
      />

      <ReaderStatusIndicators isTranslating={isTranslating} isReaderLoading={isReaderLoading} />
    </div>
  );
};
