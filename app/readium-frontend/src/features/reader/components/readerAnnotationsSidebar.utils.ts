import type { ReaderAnnotation } from '../domain/models';

export const MAX_HIGHLIGHT_PREVIEW = 160;
export const MAX_NOTE_PREVIEW = 120;

export const toPreview = (text: string | null | undefined, maxLength: number): string => {
  const normalized = (text ?? '').trim().replaceAll(/\s+/g, ' ');
  if (!normalized) {
    return '';
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength)}...`;
};

export const sortAnnotations = (annotations: ReaderAnnotation[]): ReaderAnnotation[] =>
  [...annotations].sort((left, right) => {
    if (left.page !== right.page) {
      return left.page - right.page;
    }
    return left.id - right.id;
  });
