import { useEffect, useRef } from 'react';
import type { AnnotationCapability } from '@embedpdf/plugin-annotation/react';
import { PdfAnnotationSubtype, PdfBlendMode } from '@embedpdf/models';
import type { PdfHighlightAnnoObject } from '@embedpdf/models';
import type { ReaderAnnotation } from '../../../domain/models';
import { getBoundingRect, toPdfRect } from './pdfViewport.utils';

interface UsePdfViewportAnnotationSyncParams {
  annotationCapability: Readonly<AnnotationCapability> | null;
  activeDocumentId?: string;
  activeDocument: {
    document?: {
      pages: Array<{ size: { width: number; height: number } }>;
    };
  } | null;
  annotations: ReaderAnnotation[];
  annotationIdsWithTranslation: Set<number>;
}

export const usePdfViewportAnnotationSync = ({
  annotationCapability,
  activeDocumentId,
  activeDocument,
  annotations,
  annotationIdsWithTranslation,
}: UsePdfViewportAnnotationSyncParams) => {
  const syncedAnnotationIdsRef = useRef<Map<string, Map<string, number>>>(new Map());

  useEffect(() => {
    if (!annotationCapability || !activeDocumentId || !activeDocument?.document) {
      return;
    }

    const annotationScope = annotationCapability.forDocument(activeDocumentId);
    const syncedForDocument = syncedAnnotationIdsRef.current.get(activeDocumentId) ?? new Map<string, number>();

    syncedForDocument.forEach((pageIndex, annotationId) => {
      annotationScope.purgeAnnotation(pageIndex, annotationId);
    });

    const nextSynced = new Map<string, number>();
    const importItems: Array<{ annotation: PdfHighlightAnnoObject }> = [];

    annotations.forEach((annotation) => {
      const isTranslationAnchor = annotationIdsWithTranslation.has(annotation.id) && Boolean(annotation.note?.trim());
      if (isTranslationAnchor) {
        return;
      }

      const pageIndex = annotation.page - 1;
      const page = activeDocument.document?.pages[pageIndex];
      if (!page || annotation.rects.length === 0) {
        return;
      }

      const segmentRects = annotation.rects.map((rect) => toPdfRect(rect, page.size));
      const highlightId = `backend-highlight-${annotation.id}`;
      nextSynced.set(highlightId, pageIndex);

      importItems.push({
        annotation: {
          id: highlightId,
          type: PdfAnnotationSubtype.HIGHLIGHT,
          pageIndex,
          rect: getBoundingRect(segmentRects),
          segmentRects,
          strokeColor: annotation.color,
          color: annotation.color,
          opacity: 0.42,
          blendMode: PdfBlendMode.Multiply,
          contents: annotation.note ?? annotation.selectedText,
          custom: { backendAnnotationId: annotation.id },
          flags: ['print'],
        },
      });
    });

    if (importItems.length > 0) {
      annotationScope.importAnnotations(importItems);
    }

    syncedAnnotationIdsRef.current.set(activeDocumentId, nextSynced);
  }, [annotationCapability, activeDocumentId, activeDocument, annotationIdsWithTranslation, annotations]);
};
