import { useMemo } from 'react';
import type { ReaderAnnotation } from '../../../domain/models';
import type { ReaderTranslationOverlay } from '../../readerTypes';

interface UsePdfViewportPageDataParams {
  annotations: ReaderAnnotation[];
  translationOverlays: ReaderTranslationOverlay[];
}

export const usePdfViewportPageData = ({ annotations, translationOverlays }: UsePdfViewportPageDataParams) =>
  useMemo(() => {
    const annotationsByPage = new Map<number, ReaderAnnotation[]>();
    const translationOverlaysByPage = new Map<number, ReaderTranslationOverlay[]>();

    for (const annotation of annotations) {
      const pageItems = annotationsByPage.get(annotation.page);
      if (pageItems) {
        pageItems.push(annotation);
      } else {
        annotationsByPage.set(annotation.page, [annotation]);
      }
    }

    for (const overlay of translationOverlays) {
      const pageItems = translationOverlaysByPage.get(overlay.page);
      if (pageItems) {
        pageItems.push(overlay);
      } else {
        translationOverlaysByPage.set(overlay.page, [overlay]);
      }
    }

    return {
      annotationsByPage,
      translationOverlaysByPage,
      annotationIdsWithTranslation: new Set(translationOverlays.map((overlay) => overlay.annotationId)),
    };
  }, [annotations, translationOverlays]);
