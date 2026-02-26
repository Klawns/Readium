import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { Translation } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils.ts';
import { useDismissOnPointerDownOutside } from '../ui/hooks/useDismissOnPointerDownOutside';
import { useReaderPopupLayout } from '../ui/hooks/useReaderPopupLayout';

interface TranslationPopupProps {
  translation: Translation;
  position: { x: number; y: number };
  onClose: () => void;
}

const TranslationPopup: React.FC<TranslationPopupProps> = ({ translation, position, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { isMobile, style } = useReaderPopupLayout({
    position,
    desktopWidth: 288,
    desktopOffset: 12,
  });
  const popupStyle = isMobile
    ? {
        ...style,
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        width: 'min(calc(100vw - 1.25rem), 20rem)',
      }
    : style;

  useDismissOnPointerDownOutside(popupRef, onClose);

  return (
    <div
      ref={popupRef}
      className={cn(
        'translation-popup reader-popup-surface rounded-2xl animate-in fade-in-90',
        isMobile
          ? 'w-[min(calc(100vw-1.25rem),20rem)] p-3 animate-in slide-in-from-bottom-2'
          : 'w-72 p-4 zoom-in-95',
      )}
      style={popupStyle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <h3 className={cn('line-clamp-2 font-semibold capitalize text-foreground', isMobile ? 'text-xs' : 'text-sm')}>
            {translation.originalText}
          </h3>
          <p className={cn('mt-1 text-primary', isMobile ? 'text-xs' : 'text-sm')}>{translation.translatedText}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'shrink-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700',
            isMobile ? 'h-8 w-8 -mr-1 -mt-1' : 'h-7 w-7 -mr-2 -mt-2',
          )}
          onClick={onClose}
          aria-label="Fechar traducao"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {translation.contextSentence && (
        <div
          className={cn(
            'mt-3 rounded-lg border border-slate-900/10 bg-slate-50 px-2.5 py-2 italic text-slate-500',
            isMobile ? 'text-[11px]' : 'text-xs',
          )}
        >
          "{translation.contextSentence}"
        </div>
      )}
    </div>
  );
};

export default TranslationPopup;
