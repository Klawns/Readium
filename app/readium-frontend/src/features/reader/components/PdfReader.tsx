import React from 'react';
import { Loader2 } from 'lucide-react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
import PdfToolbar from './PdfToolbar';
import { ReaderViewportShell } from './ReaderViewportShell';
import { useReaderData } from '../ui/hooks/useReaderData';
import { useTranslationOverlays } from '../ui/hooks/useTranslationOverlays';
import { useIsMobile } from '@/hooks/use-mobile.tsx';
import type { PdfReaderProps } from '../ui/pdfReader.types';
import { useReaderViewportController } from '../ui/hooks/pdf-reader/useReaderViewportController';
import { useReaderProgressSync } from '../ui/hooks/pdf-reader/useReaderProgressSync';
import { useReaderMobileUi } from '../ui/hooks/pdf-reader/useReaderMobileUi';
import { useReaderOcrHint } from '../ui/hooks/pdf-reader/useReaderOcrHint';
import { useReaderTranslationFlow } from '../ui/hooks/pdf-reader/useReaderTranslationFlow';
import { useReaderAnnotationNotes } from '../ui/hooks/pdf-reader/useReaderAnnotationNotes';
import { useReaderCopyShortcut } from '../ui/hooks/pdf-reader/useReaderCopyShortcut';
import { useReaderLifecycleDebug } from '../ui/hooks/pdf-reader/useReaderLifecycleDebug';
import { useReaderInteractionOverlayActions } from '../ui/hooks/pdf-reader/useReaderInteractionOverlayActions';
import { useReaderAnnotationsSidebar } from '../ui/hooks/pdf-reader/useReaderAnnotationsSidebar';

const PdfReader: React.FC<PdfReaderProps> = ({
  fileUrl,
  bookId,
  initialPage = 1,
  bookStatus,
  onStatusChange,
  totalPages: totalPagesFromProps = 0,
  ocrStatus,
  ocrScore,
  ocrDetails,
  onTriggerOcr,
  isTriggeringOcr,
}) => {
  const isMobile = useIsMobile();
  const [isTouchSelectionModeEnabled, setIsTouchSelectionModeEnabled] = React.useState(false);
  const { engine, isLoading: engineLoading } = usePdfiumEngine();
  const {
    containerRef,
    currentPage,
    totalPages,
    zoomLevel,
    goToPage,
    zoomIn,
    zoomOut,
    resetZoom,
    handleViewportStateChange,
    handleViewportActionsReady,
  } = useReaderViewportController({
    initialPage,
    totalPagesFromProps,
    fileUrl,
  });

  const {
    allAnnotations,
    annotations,
    translations,
    isLoading: readerLoading,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    autoTranslate,
    persistTranslation,
    isTranslating,
  } = useReaderData(bookId, currentPage);

  const translationOverlays = useTranslationOverlays(annotations, translations);
  const {
    pendingSelection,
    translationInput,
    activeTranslation,
    setPendingSelection,
    handleCreateHighlight,
    startTranslateFlow,
    saveTranslation,
    copyPendingSelection,
    handleTranslationOverlayInteract,
    closeTranslationInput,
    closeActiveTranslation,
    clearPendingSelection,
  } = useReaderTranslationFlow({
    bookId,
    createAnnotation,
    autoTranslate,
    persistTranslation,
  });
  const {
    activeAnnotationNote,
    isSavingNote,
    isDeletingNote,
    openAnnotationNote,
    closeAnnotationNote,
    saveAnnotationNote,
    deleteAnnotationNote,
  } = useReaderAnnotationNotes({
    updateAnnotation,
    deleteAnnotation,
  });

  useReaderProgressSync({
    bookId,
    currentPage,
    initialPage,
  });
  useReaderCopyShortcut({
    containerRef,
    pendingSelectionText: pendingSelection?.text,
    onCopyPendingSelection: copyPendingSelection,
  });

  const { handleTextLayerQualityEvaluated } = useReaderOcrHint({ fileUrl });
  const { isReaderUiVisible, readerChromeSpacingClass, handleViewportTap } = useReaderMobileUi({
    isMobile,
    fileUrl,
    containerRef,
  });

  const { isAnnotationsSidebarOpen, setIsAnnotationsSidebarOpen, handleGoToAnnotationPage } =
    useReaderAnnotationsSidebar({
      fileUrl,
      isMobile,
      goToPage,
    });
  const overlayActions = useReaderInteractionOverlayActions({
    handleCreateHighlight,
    copyPendingSelection,
    startTranslateFlow,
    saveTranslation,
    saveAnnotationNote,
    deleteAnnotationNote,
  });

  useReaderLifecycleDebug({
    bookId,
    fileUrl,
    initialPage,
    engineLoading,
    hasEngine: Boolean(engine),
    readerLoading,
    currentPage,
    annotationsCount: annotations.length,
    translationsCount: translations.length,
  });

  React.useEffect(() => {
    if (!isMobile) {
      setIsTouchSelectionModeEnabled(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    setIsTouchSelectionModeEnabled(false);
  }, [fileUrl]);

  const handleToggleTouchSelectionMode = React.useCallback(() => {
    setIsTouchSelectionModeEnabled((current) => {
      const next = !current;
      if (!next) {
        clearPendingSelection();
      }
      return next;
    });
  }, [clearPendingSelection]);

  if (engineLoading || !engine) {
    return (
      <div className="reader-shell flex h-[100dvh] flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Inicializando leitor...</p>
      </div>
    );
  }

  return (
    <div className="reader-shell relative flex h-[100dvh] flex-col overflow-hidden overscroll-none">
      <PdfToolbar
        bookStatus={bookStatus}
        onStatusChange={onStatusChange}
        ocrStatus={ocrStatus}
        ocrScore={ocrScore}
        ocrDetails={ocrDetails}
        onTriggerOcr={onTriggerOcr}
        isTriggeringOcr={isTriggeringOcr}
        isVisible={isReaderUiVisible}
      />

      <ReaderViewportShell
        engine={engine}
        fileUrl={fileUrl}
        containerRef={containerRef}
        readerChromeSpacingClass={readerChromeSpacingClass}
        annotations={annotations}
        allAnnotations={allAnnotations}
        translationOverlays={translationOverlays}
        initialPage={initialPage}
        currentPage={currentPage}
        totalPages={totalPages}
        zoomLevel={zoomLevel}
        pendingSelection={pendingSelection}
        translationInput={translationInput}
        activeTranslation={activeTranslation}
        activeAnnotationNote={activeAnnotationNote}
        isSavingNote={isSavingNote}
        isDeletingNote={isDeletingNote}
        isTranslating={isTranslating}
        isReaderLoading={readerLoading}
        isMobile={isMobile}
        isReaderUiVisible={isReaderUiVisible}
        isTouchSelectionModeEnabled={isTouchSelectionModeEnabled}
        isAnnotationsSidebarOpen={isAnnotationsSidebarOpen}
        onSetAnnotationsSidebarOpen={setIsAnnotationsSidebarOpen}
        onToggleTouchSelectionMode={handleToggleTouchSelectionMode}
        onSelectionResolved={setPendingSelection}
        onTranslationOverlayInteract={handleTranslationOverlayInteract}
        onAnnotationOverlayInteract={openAnnotationNote}
        onViewportStateChange={handleViewportStateChange}
        onViewportActionsReady={handleViewportActionsReady}
        onTextLayerQualityEvaluated={handleTextLayerQualityEvaluated}
        onViewportTap={handleViewportTap}
        onPageChange={goToPage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={resetZoom}
        onGoToAnnotationPage={handleGoToAnnotationPage}
        onSelectColor={overlayActions.onSelectColor}
        onCopySelection={overlayActions.onCopySelection}
        onStartTranslateFlow={overlayActions.onStartTranslateFlow}
        onCloseSelection={clearPendingSelection}
        onSaveTranslation={overlayActions.onSaveTranslation}
        onCancelTranslation={closeTranslationInput}
        onCloseActiveTranslation={closeActiveTranslation}
        onSaveAnnotationNote={overlayActions.onSaveAnnotationNote}
        onDeleteAnnotationNote={overlayActions.onDeleteAnnotationNote}
        onCancelAnnotationNote={closeAnnotationNote}
      />
    </div>
  );
};

export default PdfReader;
