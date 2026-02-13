import { useCallback, useEffect, useState } from 'react';
import { UI_CENTER_ZONE_MAX, UI_CENTER_ZONE_MIN } from './pdfReader.constants';

interface UseReaderMobileUiParams {
  isMobile: boolean;
  fileUrl: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useReaderMobileUi = ({ isMobile, fileUrl, containerRef }: UseReaderMobileUiParams) => {
  const [mobileUiVisible, setMobileUiVisible] = useState(false);
  const isReaderUiVisible = !isMobile || mobileUiVisible;
  const readerChromeSpacingClass = isReaderUiVisible ? 'pt-[68px] pb-[88px]' : 'pt-0 pb-0';

  useEffect(() => {
    setMobileUiVisible(false);
  }, [fileUrl]);

  useEffect(() => {
    if (!isMobile) {
      setMobileUiVisible(false);
    }
  }, [isMobile]);

  const handleViewportTap = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      if (!isMobile || !containerRef.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      if (containerRect.width <= 0 || containerRect.height <= 0) {
        return;
      }

      const relativeX = (x - containerRect.left) / containerRect.width;
      const relativeY = (y - containerRect.top) / containerRect.height;
      const isCenterTap =
        relativeX >= UI_CENTER_ZONE_MIN &&
        relativeX <= UI_CENTER_ZONE_MAX &&
        relativeY >= UI_CENTER_ZONE_MIN &&
        relativeY <= UI_CENTER_ZONE_MAX;

      if (!isCenterTap) {
        return;
      }

      setMobileUiVisible((visible) => !visible);
    },
    [containerRef, isMobile],
  );

  return {
    isReaderUiVisible,
    readerChromeSpacingClass,
    handleViewportTap,
  };
};
