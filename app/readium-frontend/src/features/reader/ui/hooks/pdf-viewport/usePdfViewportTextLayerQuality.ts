import { useEffect, useRef } from 'react';
import { createLogger } from '@/lib/logger.ts';
import type { PdfDocumentObject, PdfEngine } from '@embedpdf/models';
import type { DocumentState } from '@embedpdf/core';

const logger = createLogger('reader-viewport');

interface UsePdfViewportTextLayerQualityParams {
  engine: PdfEngine;
  activeDocumentId?: string;
  activeDocument: DocumentState | null;
  onTextLayerQualityEvaluated?: (lowTextLayerQuality: boolean) => void;
}

export const usePdfViewportTextLayerQuality = ({
  engine,
  activeDocumentId,
  activeDocument,
  onTextLayerQualityEvaluated,
}: UsePdfViewportTextLayerQualityParams) => {
  const analyzedDocumentIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!activeDocumentId || !activeDocument?.document || analyzedDocumentIdsRef.current.has(activeDocumentId)) {
      return;
    }

    analyzedDocumentIdsRef.current.add(activeDocumentId);
    const document = activeDocument.document as PdfDocumentObject;
    const sampleCount = Math.min(document.pageCount, 3);
    const sampleIndexes = Array.from({ length: sampleCount }, (_, index) => {
      if (sampleCount === 1) {
        return 0;
      }
      return Math.round((index * (document.pageCount - 1)) / (sampleCount - 1));
    });

    engine
      .extractText(document, sampleIndexes)
      .toPromise()
      .then((rawText) => {
        const normalizedText = rawText.replace(/\s+/g, '').trim();
        onTextLayerQualityEvaluated?.(normalizedText.length < 80);
      })
      .catch((error: unknown) => {
        logger.warn('text-layer analysis failed', error);
      });
  }, [activeDocument, activeDocumentId, engine, onTextLayerQualityEvaluated]);
};
