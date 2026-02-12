import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TranslationInputPopupProps {
  position: { x: number; y: number };
  originalText: string;
  detectedLanguage?: string;
  initialValue?: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}

const TranslationInputPopup: React.FC<TranslationInputPopupProps> = ({
  position,
  originalText,
  detectedLanguage,
  initialValue = '',
  onSave,
  onCancel,
}) => {
  const [text, setText] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (text.trim()) {
      onSave(text.trim());
    }
  };

  return (
    <div
      ref={popupRef}
      className="w-80 rounded-lg border bg-background p-3 shadow-xl animate-in fade-in-90 scale-95"
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        transform: 'translateX(-50%) translateY(calc(-100% - 12px))',
        zIndex: 1000,
      }}
    >
      <div className="mb-2 text-xs text-muted-foreground">
        Traduzindo: <span className="font-medium text-foreground italic">"{originalText}"</span>
        {detectedLanguage ? (
          <span className="ml-1">
            (idioma detectado: <span className="font-medium">{detectedLanguage}</span>)
          </span>
        ) : null}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Refine a traducao em portugues..."
          className="h-8 text-sm"
        />
        <Button type="submit" size="icon">
          <Check className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default TranslationInputPopup;
