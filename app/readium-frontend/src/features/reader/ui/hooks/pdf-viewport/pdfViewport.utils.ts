import { ZoomMode } from '@embedpdf/plugin-zoom/react';
import type { Rect } from '@embedpdf/models';
import type { ReaderRect } from '../../../domain/models';
import { DEFAULT_ZOOM_LEVEL, MOBILE_QUERY } from './pdfViewport.constants';

export const getPreferredZoomLevel = () => {
  if (typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches) {
    return ZoomMode.FitWidth;
  }
  return DEFAULT_ZOOM_LEVEL;
};

export const isTouchCapableDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || window.navigator.maxTouchPoints > 0);

export const clampPage = (page: number, totalPages: number): number => {
  if (totalPages <= 0) {
    return Math.max(1, page);
  }
  return Math.min(Math.max(1, page), totalPages);
};

export const toPdfRect = (rect: ReaderRect, pageSize: { width: number; height: number }): Rect => ({
  origin: {
    x: rect.x * pageSize.width,
    y: rect.y * pageSize.height,
  },
  size: {
    width: rect.width * pageSize.width,
    height: rect.height * pageSize.height,
  },
});

export const getBoundingRect = (rects: Rect[]): Rect => {
  const [firstRect, ...rest] = rects;
  let minX = firstRect.origin.x;
  let minY = firstRect.origin.y;
  let maxX = firstRect.origin.x + firstRect.size.width;
  let maxY = firstRect.origin.y + firstRect.size.height;

  rest.forEach((rect) => {
    minX = Math.min(minX, rect.origin.x);
    minY = Math.min(minY, rect.origin.y);
    maxX = Math.max(maxX, rect.origin.x + rect.size.width);
    maxY = Math.max(maxY, rect.origin.y + rect.size.height);
  });

  return {
    origin: { x: minX, y: minY },
    size: { width: maxX - minX, height: maxY - minY },
  };
};
