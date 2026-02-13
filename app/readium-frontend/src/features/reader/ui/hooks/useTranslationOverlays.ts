import { useMemo } from 'react';
import type { Translation } from '@/types';
import type { ReaderAnnotation } from '../../domain/models';
import type { ReaderTranslationOverlay } from '../readerTypes';

export const useTranslationOverlays = (
  annotations: ReaderAnnotation[],
  translations: Translation[],
): ReaderTranslationOverlay[] =>
  useMemo(() => {
    const translationByText = new Map<string, Translation>();
    translations.forEach((item) => {
      translationByText.set(item.originalText.trim().toLowerCase(), item);
    });

    return annotations
      .map((annotation) => ({
        annotation,
        translation: translationByText.get(annotation.selectedText.trim().toLowerCase()),
      }))
      .filter((item): item is { annotation: ReaderAnnotation; translation: Translation } => Boolean(item.translation))
      .flatMap(({ annotation, translation }) =>
        annotation.rects.map((rect, index) => ({
          annotationId: annotation.id,
          key: `${annotation.id}-${index}`,
          page: annotation.page,
          rect,
          translation,
        })),
      );
  }, [annotations, translations]);
