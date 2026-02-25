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

  useDismissOnPointerDownOutside(popupRef, onClose);

  return (
    <div
      ref={popupRef}
      className={cn(
        'translation-popup reader-popup-surface rounded-2xl animate-in fade-in-90 zoom-in-95',
        isMobile ? 'w-auto p-3.5' : 'w-72 p-4',
      )}
      style={style}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <h3 className="line-clamp-2 text-sm font-semibold capitalize text-foreground">{translation.originalText}</h3>
          <p className="mt-1 text-sm text-primary">{translation.translatedText}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn('shrink-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700', isMobile ? 'h-8 w-8 -mr-1 -mt-1' : 'h-7 w-7 -mr-2 -mt-2')}
          onClick={onClose}
          aria-label="Fechar traducao"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {translation.contextSentence && (
        <div className="mt-3 rounded-lg border border-slate-900/10 bg-slate-50 px-2.5 py-2 text-xs italic text-slate-500">
          "{translation.contextSentence}"
        </div>
      )}
    </div>
  );
};

export default TranslationPopup;
