import type { ReaderAnnotation } from '../../domain/models';

const PAGE_WINDOW_RADIUS = 1;

export const buildAnnotationPageWindow = (currentPage: number): number[] => {
  if (currentPage <= 0) {
    return [];
  }

  const pages = new Set<number>();
  for (let page = currentPage - PAGE_WINDOW_RADIUS; page <= currentPage + PAGE_WINDOW_RADIUS; page += 1) {
    if (page > 0) {
      pages.add(page);
    }
  }
  return [...pages].sort((left, right) => left - right);
};

export const mergePageAnnotations = (annotationsByPage: Array<ReaderAnnotation[] | undefined>): ReaderAnnotation[] => {
  const seen = new Set<number>();
  const merged: ReaderAnnotation[] = [];

  for (const pageAnnotations of annotationsByPage) {
    for (const annotation of pageAnnotations ?? []) {
      if (seen.has(annotation.id)) {
        continue;
      }
      seen.add(annotation.id);
      merged.push(annotation);
    }
  }

  return merged;
};
