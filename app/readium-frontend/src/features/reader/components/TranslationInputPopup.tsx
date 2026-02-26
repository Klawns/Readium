import React, { useEffect, useRef, useState } from 'react';
import { Check, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils.ts';
import { useDismissOnPointerDownOutside } from '../ui/hooks/useDismissOnPointerDownOutside';
import { useReaderPopupLayout } from '../ui/hooks/useReaderPopupLayout';

interface TranslationInputPopupProps {
  position: { x: number; y: number };
  originalText: string;
  detectedLanguage?: string;
  initialValue?: string;
  googleTranslateUrl?: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}

const TranslationInputPopup: React.FC<TranslationInputPopupProps> = ({
  position,
  originalText,
  detectedLanguage,
  initialValue = '',
  googleTranslateUrl,
  onSave,
  onCancel,
}) => {
  const [text, setText] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const { isMobile, style } = useReaderPopupLayout({
    position,
    desktopWidth: 352,
    desktopOffset: 12,
  });
  const popupStyle = isMobile
    ? {
        ...style,
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        width: 'min(calc(100vw - 1.25rem), 22rem)',
      }
    : style;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  useDismissOnPointerDownOutside(popupRef, onCancel);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (text.trim()) {
      onSave(text.trim());
    }
  };

  return (
    <div
      ref={popupRef}
      className={cn(
        'reader-popup-surface rounded-2xl animate-in fade-in-90',
        isMobile
          ? 'w-[min(calc(100vw-1.25rem),22rem)] p-3 animate-in slide-in-from-bottom-2'
          : 'w-80 p-3.5 zoom-in-95',
      )}
      style={popupStyle}
    >
      <div className={cn('text-muted-foreground', isMobile ? 'mb-1.5 text-[11px]' : 'mb-2 text-xs')}>
        Traduzindo: <span className="font-medium text-foreground italic">"{originalText}"</span>
        {detectedLanguage ? (
          <span className="ml-1">
            (idioma detectado: <span className="font-medium">{detectedLanguage}</span>)
          </span>
        ) : null}
      </div>
      <form onSubmit={handleSubmit} className={cn('gap-2', isMobile ? 'grid grid-cols-[1fr_auto_auto]' : 'flex')}>
        <Input
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Refine a traducao em portugues..."
          className={cn(
            'border-slate-900/10 bg-white focus-visible:ring-slate-300',
            isMobile ? 'h-8 text-xs' : 'h-8 text-sm',
          )}
        />
        <Button type="submit" size="icon" className={cn('rounded-lg', isMobile ? 'h-8 w-8' : 'h-8 w-8')}>
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className={cn(
            'rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800',
            isMobile ? 'h-8 w-8' : 'h-8 w-8',
          )}
        >
          <X className="h-4 w-4" />
        </Button>
      </form>
      {googleTranslateUrl ? (
        <div
          className={cn(
            'mt-2 rounded-lg border border-slate-900/10 bg-slate-50 px-2.5 py-2 text-slate-500',
            isMobile ? 'text-[11px]' : 'text-xs',
          )}
        >
          Traducao automatica indisponivel neste trecho.
          <Button asChild variant="link" size="sm" className="h-auto px-1 py-0 text-xs">
            <a href={googleTranslateUrl} target="_blank" rel="noopener noreferrer">
              Abrir no Google Tradutor <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default TranslationInputPopup;
