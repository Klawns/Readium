import React, { useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { DocumentContent } from '@embedpdf/plugin-document-manager/react';
import { createLogger } from '@/lib/logger.ts';
import type { ReaderAnnotation } from '../domain/models';
import type { PendingSelection, ReaderTranslationOverlay } from '../ui/readerTypes';
import type {
  AnnotationOverlayInteractPayload,
  TranslationOverlayInteractPayload,
} from '../ui/hooks/pdf-viewport/PdfDocumentViewport.types';
import type { PdfViewportInteractionBindings } from '../ui/hooks/pdf-viewport/usePdfViewportInteractionController';
import { PdfViewportCanvas } from './PdfViewportCanvas';

const logger = createLogger('reader-viewport');

interface PdfDocumentViewportContentProps {
  activeDocumentId: string;
  touchAction: string;
  pendingSelection: PendingSelection | null;
  annotationsByPage: Map<number, ReaderAnnotation[]>;
  translationOverlaysByPage: Map<number, ReaderTranslationOverlay[]>;
  interactionBindings: PdfViewportInteractionBindings;
  onTranslationOverlayInteract?: (payload: TranslationOverlayInteractPayload) => void;
  onAnnotationOverlayInteract?: (payload: AnnotationOverlayInteractPayload) => void;
}

export const PdfDocumentViewportContent: React.FC<PdfDocumentViewportContentProps> = ({
  activeDocumentId,
  touchAction,
  pendingSelection,
  annotationsByPage,
  translationOverlaysByPage,
  interactionBindings,
  onTranslationOverlayInteract,
  onAnnotationOverlayInteract,
}) => {
  const lastDocumentContentStateRef = useRef<string>('');

  return (
    <DocumentContent documentId={activeDocumentId}>
      {({ isLoaded, isError, documentState }) => {
        const contentState = isError ? 'error' : isLoaded ? 'loaded' : 'loading';
        if (lastDocumentContentStateRef.current !== contentState) {
          lastDocumentContentStateRef.current = contentState;
          logger.debug('document content state', {
            documentId: activeDocumentId,
            state: contentState,
            error: documentState.error ?? null,
          });
        }

        if (isError) {
          return (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
              Falha ao carregar PDF: {documentState.error ?? 'erro desconhecido'}.
            </div>
          );
        }

        if (!isLoaded) {
          logger.debug('document loading', activeDocumentId);
          return (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        return (
          <PdfViewportCanvas
            activeDocumentId={activeDocumentId}
            touchAction={touchAction}
            pendingSelection={pendingSelection}
            annotationsByPage={annotationsByPage}
            translationOverlaysByPage={translationOverlaysByPage}
            interactionBindings={interactionBindings}
            onTranslationOverlayInteract={onTranslationOverlayInteract}
            onAnnotationOverlayInteract={onAnnotationOverlayInteract}
          />
        );
      }}
    </DocumentContent>
  );
};
