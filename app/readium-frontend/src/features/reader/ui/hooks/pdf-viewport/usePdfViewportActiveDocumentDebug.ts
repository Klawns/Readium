import { useEffect } from 'react';
import { createLogger } from '@/lib/logger.ts';
import type { DocumentState } from '@embedpdf/core';

const logger = createLogger('reader-viewport');

interface UsePdfViewportActiveDocumentDebugParams {
  activeDocumentId?: string;
  activeDocument: DocumentState | null;
  overlaysCount: number;
  annotationsCount: number;
}

export const usePdfViewportActiveDocumentDebug = ({
  activeDocumentId,
  activeDocument,
  overlaysCount,
  annotationsCount,
}: UsePdfViewportActiveDocumentDebugParams) => {
  useEffect(() => {
    logger.debug('viewport active document', {
      activeDocumentId,
      hasDocument: Boolean(activeDocument?.document),
      overlays: overlaysCount,
      annotations: annotationsCount,
    });
  }, [activeDocumentId, activeDocument?.document, overlaysCount, annotationsCount]);
};
