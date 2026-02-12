import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
import type { BookStatus, OcrStatus, Translation } from '@/types';
import { updateProgress } from '@/services/bookApi';
import PdfToolbar from './PdfToolbar';
import ReaderControlsDock from './ReaderControlsDock';
import TranslationInputPopup from './TranslationInputPopup';
import TranslationPopup from './TranslationPopup';
import { SelectionActionPopup } from '../ui/components/SelectionActionPopup';
import { useReaderData } from '../ui/hooks/useReaderData';
import type { ReaderRect } from '../domain/models';
import type { PendingSelection, ReaderViewportActions, ReaderViewportState } from './readerTypes';
import { PdfDocumentViewport } from './PdfDocumentViewport';
import { useTranslationOverlays } from './useTranslationOverlays';
import { toast } from 'sonner';

const DEFAULT_ZOOM_LEVEL = 1.7;

interface PdfReaderProps {
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

interface TranslationInputState {
  position: { x: number; y: number };
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  page: number;
  rects: ReaderRect[];
}

interface ActiveTranslationState {
  translation: Translation;
  position: { x: number; y: number };
}

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
  const { engine, isLoading: engineLoading } = usePdfiumEngine();
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
  const [translationInput, setTranslationInput] = useState<TranslationInputState | null>(null);
  const [activeTranslation, setActiveTranslation] = useState<ActiveTranslationState | null>(null);
  const [viewportState, setViewportState] = useState<ReaderViewportState>({
    currentPage: initialPage,
    totalPages: totalPagesFromProps,
    zoomLevel: DEFAULT_ZOOM_LEVEL,
  });

  const viewportActionsRef = useRef<ReaderViewportActions | null>(null);
  const initializedViewByFileRef = useRef<Map<string, boolean>>(new Map());
  const ocrHintShownByFileRef = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentPage = Math.max(1, viewportState.currentPage);
  const totalPages = viewportState.totalPages > 0 ? viewportState.totalPages : totalPagesFromProps;
  const zoomLevel = viewportState.zoomLevel || DEFAULT_ZOOM_LEVEL;

  const {
    annotations,
    translations,
    isLoading: readerLoading,
    createAnnotation,
    autoTranslate,
    persistTranslation,
    isTranslating,
  } = useReaderData(bookId, currentPage);

  const translationOverlays = useTranslationOverlays(annotations, translations);

  useEffect(() => {
    console.info('[EmbedPDF Reader] annotations', annotations.length, 'translations', translations.length, 'loading', readerLoading);
  }, [annotations.length, translations.length, readerLoading]);

  useEffect(() => {
    if (engine && !engineLoading) {
      console.info('[EmbedPDF Reader] engine initialized');
    }
  }, [engine, engineLoading]);

  useEffect(() => {
    setViewportState((previous) => ({
      ...previous,
      currentPage: initialPage,
    }));

    if (viewportActionsRef.current) {
      viewportActionsRef.current.goToPage(initialPage);
    }
  }, [initialPage]);

  useEffect(() => {
    if (!currentPage) {
      return;
    }

    const timeout = setTimeout(() => {
      updateProgress(bookId, currentPage).catch((error: unknown) => {
        console.error('Failed to save progress', error);
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [bookId, currentPage]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentPage > 0) {
        void updateProgress(bookId, currentPage, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [bookId, currentPage]);

  const handleCreateHighlight = useCallback(
    async (color: string) => {
      if (!pendingSelection) {
        return;
      }

      await createAnnotation({
        bookId,
        page: pendingSelection.page,
        rects: pendingSelection.rects,
        color,
        selectedText: pendingSelection.text,
      });
      setPendingSelection(null);
    },
    [bookId, createAnnotation, pendingSelection],
  );

  const startTranslateFlow = useCallback(async () => {
    if (!pendingSelection) {
      return;
    }

    try {
      const autoTranslation = await autoTranslate(pendingSelection.text);
      setTranslationInput({
        position: pendingSelection.popupPosition,
        originalText: pendingSelection.text,
        translatedText: autoTranslation.translatedText,
        detectedLanguage: autoTranslation.detectedLanguage,
        page: pendingSelection.page,
        rects: pendingSelection.rects,
      });
    } catch (error: unknown) {
      console.error('Automatic translation failed', error);
      toast.error('Falha na traducao automatica. Voce pode preencher manualmente.');
      setTranslationInput({
        position: pendingSelection.popupPosition,
        originalText: pendingSelection.text,
        translatedText: '',
        detectedLanguage: 'unknown',
        page: pendingSelection.page,
        rects: pendingSelection.rects,
      });
    }
    setPendingSelection(null);
  }, [autoTranslate, pendingSelection]);

  const saveTranslation = useCallback(
    async (translatedText: string) => {
      if (!translationInput) {
        return;
      }

      await persistTranslation({
        bookId,
        originalText: translationInput.originalText.trim().toLowerCase(),
        translatedText,
      });

      await createAnnotation({
        bookId,
        page: translationInput.page,
        rects: translationInput.rects,
        color: '#FDE68A',
        selectedText: translationInput.originalText,
        note: translatedText,
      });

      setTranslationInput(null);
    },
    [bookId, createAnnotation, persistTranslation, translationInput],
  );

  const goToPage = useCallback((page: number) => {
    viewportActionsRef.current?.goToPage(page);
  }, []);

  const zoomIn = useCallback(() => {
    viewportActionsRef.current?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    viewportActionsRef.current?.zoomOut();
  }, []);

  const resetZoom = useCallback(() => {
    viewportActionsRef.current?.resetZoom();
  }, []);

  const handleViewportStateChange = useCallback((nextState: ReaderViewportState) => {
    setViewportState((previous) => {
      if (
        previous.currentPage === nextState.currentPage &&
        previous.totalPages === nextState.totalPages &&
        previous.zoomLevel === nextState.zoomLevel
      ) {
        return previous;
      }
      return nextState;
    });
  }, []);

  const handleViewportActionsReady = useCallback((actions: ReaderViewportActions | null) => {
    viewportActionsRef.current = actions;

    if (!actions) {
      return;
    }

    if (initializedViewByFileRef.current.get(fileUrl)) {
      return;
    }

    requestAnimationFrame(() => {
      actions.goToPage(initialPage);
      actions.resetZoom();
      initializedViewByFileRef.current.set(fileUrl, true);
    });
  }, [fileUrl, initialPage]);

  useEffect(() => {
    initializedViewByFileRef.current.delete(fileUrl);
    ocrHintShownByFileRef.current.delete(fileUrl);
  }, [fileUrl]);

  const handleTextLayerQualityEvaluated = useCallback(
    (lowTextLayerQuality: boolean) => {
      if (!lowTextLayerQuality || ocrHintShownByFileRef.current.has(fileUrl)) {
        return;
      }

      toast.warning('Este PDF parece ter OCR fraco. A selecao pode ficar imprecisa em alguns trechos.');
      ocrHintShownByFileRef.current.add(fileUrl);
    },
    [fileUrl],
  );

  if (engineLoading || !engine) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-background text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Inicializando leitor...</p>
      </div>
    );
  }

  if (readerLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-background text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Carregando anotacoes...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/20">
      <PdfToolbar
        bookStatus={bookStatus}
        onStatusChange={onStatusChange}
        ocrStatus={ocrStatus}
        ocrScore={ocrScore}
        onTriggerOcr={onTriggerOcr}
        isTriggeringOcr={isTriggeringOcr}
      />

      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-gradient-to-b from-muted/30 via-muted/15 to-background">
        <PdfDocumentViewport
          engine={engine}
          fileUrl={fileUrl}
          containerRef={containerRef}
          annotations={annotations}
          initialPage={initialPage}
          onSelectionResolved={setPendingSelection}
          onViewportStateChange={handleViewportStateChange}
          onViewportActionsReady={handleViewportActionsReady}
          onTextLayerQualityEvaluated={handleTextLayerQualityEvaluated}
        />

        <ReaderControlsDock
          currentPage={currentPage}
          totalPages={totalPages}
          zoomLevel={zoomLevel}
          onPageChange={goToPage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={resetZoom}
        />

        {pendingSelection && (
          <SelectionActionPopup
            position={pendingSelection.popupPosition}
            onSelectColor={(color) => {
              void handleCreateHighlight(color);
            }}
            onTranslate={() => {
              void startTranslateFlow();
            }}
            onClose={() => setPendingSelection(null)}
          />
        )}

        {translationInput && (
          <TranslationInputPopup
            position={translationInput.position}
            originalText={translationInput.originalText}
            initialValue={translationInput.translatedText}
            detectedLanguage={translationInput.detectedLanguage}
            onSave={(value) => {
              void saveTranslation(value);
            }}
            onCancel={() => setTranslationInput(null)}
          />
        )}

        {activeTranslation && (
          <TranslationPopup
            translation={activeTranslation.translation}
            position={activeTranslation.position}
            onClose={() => setActiveTranslation(null)}
          />
        )}

        <div className="pointer-events-none absolute inset-0 z-20">
          {translationOverlays
            .filter((overlay) => overlay.page === currentPage)
            .map((overlay) => (
              <button
                key={overlay.key}
                type="button"
                className="pointer-events-auto absolute border-b-2 border-blue-700 bg-transparent"
                style={{
                  left: `${overlay.rect.x * 100}%`,
                  top: `${overlay.rect.y * 100}%`,
                  width: `${overlay.rect.width * 100}%`,
                  height: `${overlay.rect.height * 100}%`,
                }}
                title={`${overlay.translation.originalText} -> ${overlay.translation.translatedText}`}
                onMouseEnter={(event) => {
                  setActiveTranslation({
                    translation: overlay.translation,
                    position: { x: event.clientX, y: event.clientY },
                  });
                }}
                onClick={(event) => {
                  setActiveTranslation({
                    translation: overlay.translation,
                    position: { x: event.clientX, y: event.clientY },
                  });
                }}
              />
            ))}
        </div>

        {isTranslating && (
          <div className="absolute inset-x-0 bottom-16 z-30 flex justify-center sm:bottom-24">
            <div className="rounded-md bg-black/85 px-3 py-1 text-xs text-white">Traduzindo selecao...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfReader;
