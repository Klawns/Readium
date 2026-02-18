import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
import PdfToolbar from './PdfToolbar';
import ReaderControlsDock from './ReaderControlsDock';
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
    annotations,
    translations,
    isLoading: readerLoading,
    createAnnotation,
    updateAnnotation,
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
    openAnnotationNote,
    closeAnnotationNote,
    saveAnnotationNote,
  } = useReaderAnnotationNotes({
    updateAnnotation,
  });

  useReaderProgressSync({
    bookId,
    currentPage,
  });

  const { handleTextLayerQualityEvaluated } = useReaderOcrHint({ fileUrl });
  const { isReaderUiVisible, readerChromeSpacingClass, handleViewportTap } = useReaderMobileUi({
    isMobile,
    fileUrl,
    containerRef,
  });

  useEffect(() => {
    logger.debug('reader mount', { bookId, fileUrl, initialPage });
    return () => {
      logger.debug('reader unmount', { bookId, fileUrl });
    };
  }, [bookId, fileUrl, initialPage]);

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
          onViewportTap={handleViewportTap}
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

        {pendingSelection && (
          <SelectionActionPopup
            position={pendingSelection.popupPosition}
            onSelectColor={(color) => {
              void handleCreateHighlight(color);
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
            onSave={(note) => {
              void saveAnnotationNote(note);
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
