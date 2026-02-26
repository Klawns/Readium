import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isDeviceOnline } from '../../application/services/offline-network-service';

const BANNER_VISIBLE_MS = 5_000;

export const NetworkStatusBanner = () => {
  const initialOnlineState = isDeviceOnline();
  const [isOnline, setIsOnline] = useState<boolean>(initialOnlineState);
  const [isVisible, setIsVisible] = useState<boolean>(() => !initialOnlineState);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleOnline = () => {
      setIsOnline(true);
      setIsVisible(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
    }, BANNER_VISIBLE_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isVisible, isOnline]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] px-3 pt-2">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'mx-auto flex w-full max-w-2xl items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur',
          isOnline
            ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
            : 'border-amber-200 bg-amber-50/95 text-amber-900',
        )}
      >
        {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        <span>{isOnline ? 'Voce esta online.' : 'Voce esta offline.'}</span>
      </div>
    </div>
  );
};
