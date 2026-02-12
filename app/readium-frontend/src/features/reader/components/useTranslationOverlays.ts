import { useMemo } from 'react';
import type { Translation } from '@/types';
import type { ReaderAnnotation, ReaderRect } from '../domain/models';

export interface TranslationOverlay {
  key: string;
  page: number;
  rect: ReaderRect;
  translation: Translation;
}

export const useTranslationOverlays = (
  annotations: ReaderAnnotation[],
  translations: Translation[],
): TranslationOverlay[] =>
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
          key: `${annotation.id}-${index}`,
          page: annotation.page,
          rect,
          translation,
        })),
      );
  }, [annotations, translations]);
