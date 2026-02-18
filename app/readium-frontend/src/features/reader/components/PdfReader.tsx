import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
import PdfToolbar from './PdfToolbar';
import ReaderControlsDock from './ReaderControlsDock';
import ReaderAnnotationsSidebar from './ReaderAnnotationsSidebar';
import TranslationInputPopup from './TranslationInputPopup';
import TranslationPopup from './TranslationPopup';
import AnnotationNotePopup from './AnnotationNotePopup';
import { SelectionActionPopup } from '../ui/components/SelectionActionPopup';
import { useReaderData } from '../ui/hooks/useReaderData';
import { PdfDocumentViewport } from './PdfDocumentViewport';
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
import { createLogger } from '@/lib/logger.ts';

const logger = createLogger('reader');

const PdfReader: React.FC<PdfReaderProps> = ({
  fileUrl,
  bookId,
  initialPage = 1,
  bookStatus,
  onStatusChange,
  totalPages: totalPagesFromProps = 0,
  ocrStatus,
  ocrScore,
  onTriggerOcr,
  isTriggeringOcr,
}) => {
  const isMobile = useIsMobile();
  const [isAnnotationsSidebarOpen, setIsAnnotationsSidebarOpen] = useState(false);
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

  const handleReaderViewportTap = useCallback(
    (payload: { x: number; y: number }) => {
      handleViewportTap(payload);
    },
    [handleViewportTap],
  );

  const handleGoToAnnotationPage = useCallback(
    (page: number) => {
      goToPage(page);
      if (isMobile) {
        setIsAnnotationsSidebarOpen(false);
      }
    },
    [goToPage, isMobile],
  );

  useEffect(() => {
    logger.debug('reader mount', { bookId, fileUrl, initialPage });
    return () => {
      logger.debug('reader unmount', { bookId, fileUrl });
    };
  }, [bookId, fileUrl, initialPage]);

  useEffect(() => {
    setIsAnnotationsSidebarOpen(false);
  }, [fileUrl]);

  useEffect(() => {
    logger.debug('engine state', {
      engineLoading,
      hasEngine: Boolean(engine),
    });
  }, [engineLoading, engine]);

  useEffect(() => {
    logger.debug('reader data state', {
      readerLoading,
      currentPage,
      annotationsCount: annotations.length,
      translationsCount: translations.length,
    });
  }, [readerLoading, currentPage, annotations.length, translations.length]);

  if (engineLoading || !engine) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-2 bg-background text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Inicializando leitor...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden overscroll-none bg-muted/20">
      {isReaderUiVisible && (
        <PdfToolbar
          bookStatus={bookStatus}
          onStatusChange={onStatusChange}
          ocrStatus={ocrStatus}
          ocrScore={ocrScore}
          onTriggerOcr={onTriggerOcr}
          isTriggeringOcr={isTriggeringOcr}
        />
      )}

      <div
        ref={containerRef}
        className={`relative flex-1 overflow-hidden bg-gradient-to-b from-muted/30 via-muted/15 to-background ${readerChromeSpacingClass}`}
      >
        <PdfDocumentViewport
          engine={engine}
          fileUrl={fileUrl}
          containerRef={containerRef}
          annotations={annotations}
          translationOverlays={translationOverlays}
          initialPage={initialPage}
          onSelectionResolved={setPendingSelection}
          onTranslationOverlayInteract={handleTranslationOverlayInteract}
          onAnnotationOverlayInteract={openAnnotationNote}
          onViewportStateChange={handleViewportStateChange}
          onViewportActionsReady={handleViewportActionsReady}
          onTextLayerQualityEvaluated={handleTextLayerQualityEvaluated}
          onViewportTap={handleReaderViewportTap}
        />

        {isReaderUiVisible && (
          <ReaderControlsDock
            currentPage={currentPage}
            totalPages={totalPages}
            zoomLevel={zoomLevel}
            onPageChange={goToPage}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomReset={resetZoom}
          />
        )}

        <ReaderAnnotationsSidebar
          annotations={allAnnotations}
          currentPage={currentPage}
          isOpen={isAnnotationsSidebarOpen}
          isVisible={!isMobile || isReaderUiVisible}
          onOpenChange={setIsAnnotationsSidebarOpen}
          onGoToPage={handleGoToAnnotationPage}
        />

        {pendingSelection && (
          <SelectionActionPopup
            position={pendingSelection.popupPosition}
            onSelectColor={(color) => {
              void handleCreateHighlight(color);
            }}
            onCopy={() => {
              void copyPendingSelection();
            }}
            onTranslate={() => {
              void startTranslateFlow();
            }}
            onClose={clearPendingSelection}
          />
        )}

        {translationInput && (
          <TranslationInputPopup
            position={translationInput.position}
            originalText={translationInput.originalText}
            initialValue={translationInput.translatedText}
            detectedLanguage={translationInput.detectedLanguage}
            googleTranslateUrl={translationInput.googleTranslateUrl}
            onSave={(value) => {
              void saveTranslation(value);
            }}
            onCancel={closeTranslationInput}
          />
        )}

        {activeTranslation && (
          <TranslationPopup
            translation={activeTranslation.translation}
            position={activeTranslation.position}
            onClose={closeActiveTranslation}
          />
        )}

        {activeAnnotationNote && (
          <AnnotationNotePopup
            annotation={activeAnnotationNote.annotation}
            position={activeAnnotationNote.position}
            isSaving={isSavingNote}
            isDeleting={isDeletingNote}
            onSave={(note) => {
              void saveAnnotationNote(note);
            }}
            onDelete={() => {
              void deleteAnnotationNote();
            }}
            onCancel={closeAnnotationNote}
          />
        )}

        {isTranslating && (
          <div className="absolute inset-x-0 bottom-16 z-30 flex justify-center sm:bottom-24">
            <div className="rounded-md bg-black/85 px-3 py-1 text-xs text-white">Traduzindo selecao...</div>
          </div>
        )}

        {readerLoading && (
          <div className="absolute right-3 top-3 z-30 rounded-md bg-black/75 px-2 py-1 text-[11px] text-white">
            Carregando dados...
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfReader;
