import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Translation } from '@/types';
import { Button } from '@/components/ui/button';

interface TranslationPopupProps {
  translation: Translation;
  position: { x: number; y: number };
  onClose: () => void;
}

const TranslationPopup: React.FC<TranslationPopupProps> = ({ translation, position, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: position.y,
    left: position.x,
    transform: 'translateX(-50%) translateY(calc(-100% - 12px))',
    zIndex: 1000,
  };

  return (
    <div 
      ref={popupRef}
      className="
        translation-popup w-64 rounded-lg border bg-background p-4 shadow-xl 
        animate-in fade-in-90 scale-95
      "
      style={style}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <h3 className="font-semibold capitalize text-foreground">{translation.originalText}</h3>
          <p className="text-sm text-primary">{translation.translatedText}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 shrink-0" onClick={onClose}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {translation.contextSentence && (
        <div className="mt-3 text-xs italic text-muted-foreground border-l-2 pl-2">
          "{translation.contextSentence}"
        </div>
      )}
    </div>
  );
};

export default TranslationPopup;
