import { useEffect } from 'react';

interface UseReaderProgressLifecycleParams {
  flushProgress: (keepalive?: boolean) => void;
}

export const useReaderProgressLifecycle = ({ flushProgress }: UseReaderProgressLifecycleParams) => {
  useEffect(() => {
    return () => {
      flushProgress();
    };
  }, [flushProgress]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushProgress(true);
    };
    const handlePageHide = () => {
      flushProgress(true);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushProgress(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushProgress]);
};
