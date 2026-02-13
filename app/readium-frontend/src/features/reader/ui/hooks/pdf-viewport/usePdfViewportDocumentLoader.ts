import { useEffect, useRef } from 'react';
import type { DocumentManagerCapability } from '@embedpdf/plugin-document-manager/react';
import { createLogger } from '@/lib/logger.ts';
import type { ReaderViewportActions, ReaderViewportState } from '../../readerTypes';
import { DEFAULT_ZOOM_LEVEL } from './pdfViewport.constants';

const logger = createLogger('reader-viewport');

interface UsePdfViewportDocumentLoaderParams {
  documentManager: Readonly<DocumentManagerCapability> | null;
  fileUrl: string;
  activeDocumentId?: string;
  onViewportActionsReady?: (actions: ReaderViewportActions | null) => void;
  onViewportStateChange?: (state: ReaderViewportState) => void;
}

export const usePdfViewportDocumentLoader = ({
  documentManager,
  fileUrl,
  activeDocumentId,
  onViewportActionsReady,
  onViewportStateChange,
}: UsePdfViewportDocumentLoaderParams) => {
  const lastOpenedUrlRef = useRef<string | null>(null);
  const hasLoggedMissingManagerRef = useRef(false);

  useEffect(() => {
    if (!documentManager) {
      if (!hasLoggedMissingManagerRef.current) {
        hasLoggedMissingManagerRef.current = true;
        logger.debug('document manager unavailable, waiting plugin initialization');
      }
      return;
    }

    hasLoggedMissingManagerRef.current = false;

    if (!fileUrl) {
      logger.warn('empty fileUrl received, skipping openDocumentUrl');
      return;
    }

    if (lastOpenedUrlRef.current === fileUrl) {
      logger.debug('skipping openDocumentUrl because url already opened', fileUrl);
      return;
    }

    logger.debug('opening document', fileUrl);
    documentManager.openDocumentUrl({
      url: fileUrl,
    });
    lastOpenedUrlRef.current = fileUrl;
  }, [documentManager, fileUrl]);

  useEffect(() => {
    if (activeDocumentId) {
      logger.debug('activeDocumentId', activeDocumentId);
      return;
    }

    onViewportActionsReady?.(null);
    onViewportStateChange?.({
      currentPage: 1,
      totalPages: 0,
      zoomLevel: DEFAULT_ZOOM_LEVEL,
    });
  }, [activeDocumentId, onViewportActionsReady, onViewportStateChange]);
};
