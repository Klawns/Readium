import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useIsMobile } from '@/hooks/use-mobile.tsx';

interface PopupPosition {
  x: number;
  y: number;
}

interface UseReaderPopupLayoutParams {
  position: PopupPosition;
  desktopWidth: number;
  desktopOffset?: number;
  desktopTopSafeZone?: number;
  viewportMargin?: number;
}

interface ReaderPopupLayout {
  isMobile: boolean;
  shouldOpenBelow: boolean;
  style: CSSProperties;
}

const MOBILE_BOTTOM_OFFSET = 'calc(env(safe-area-inset-bottom, 0px) + 1rem)';
const DEFAULT_VIEWPORT_WIDTH = 1280;
const DEFAULT_VIEWPORT_HEIGHT = 720;
const DEFAULT_POPUP_Z_INDEX = 1000;

const clamp = (value: number, min: number, max: number) => {
  if (min > max) {
    return (min + max) / 2;
  }
  return Math.min(Math.max(value, min), max);
};

const getViewportSize = () => {
  if (typeof window === 'undefined') {
    return { width: DEFAULT_VIEWPORT_WIDTH, height: DEFAULT_VIEWPORT_HEIGHT };
  }
  return { width: window.innerWidth, height: window.innerHeight };
};

export const useReaderPopupLayout = ({
  position,
  desktopWidth,
  desktopOffset = 12,
  desktopTopSafeZone = 160,
  viewportMargin = 12,
}: UseReaderPopupLayoutParams): ReaderPopupLayout => {
  const isMobile = useIsMobile();

  return useMemo(() => {
    if (isMobile) {
      return {
        isMobile: true,
        shouldOpenBelow: true,
        style: {
          position: 'fixed',
          left: '1rem',
          right: '1rem',
          bottom: MOBILE_BOTTOM_OFFSET,
          zIndex: DEFAULT_POPUP_Z_INDEX,
        },
      };
    }

    const viewport = getViewportSize();
    const margin = Math.max(8, viewportMargin);
    const resolvedWidth = Math.min(desktopWidth, Math.max(320, viewport.width - margin * 2));

    const halfWidth = resolvedWidth / 2;
    const minLeft = halfWidth + margin;
    const maxLeft = viewport.width - halfWidth - margin;
    const left = clamp(position.x, minLeft, maxLeft);

    const shouldOpenBelow = position.y < desktopTopSafeZone;
    const top = clamp(position.y, margin + desktopOffset, viewport.height - margin - desktopOffset);

    return {
      isMobile: false,
      shouldOpenBelow,
      style: {
        position: 'fixed',
        top,
        left,
        transform: shouldOpenBelow
          ? `translate(-50%, ${desktopOffset}px)`
          : `translate(-50%, calc(-100% - ${desktopOffset}px))`,
        zIndex: DEFAULT_POPUP_Z_INDEX,
      },
    };
  }, [desktopOffset, desktopTopSafeZone, desktopWidth, isMobile, position.x, position.y, viewportMargin]);
};
