import React from 'react';

interface ReaderStatusIndicatorsProps {
  isTranslating: boolean;
  isReaderLoading: boolean;
}

export const ReaderStatusIndicators: React.FC<ReaderStatusIndicatorsProps> = ({
  isTranslating,
  isReaderLoading,
}) => (
  <>
    {isTranslating && (
      <div className="absolute inset-x-0 bottom-16 z-30 flex justify-center sm:bottom-24">
        <div className="reader-floating-surface rounded-full px-3 py-1 text-xs text-slate-700">Traduzindo selecao...</div>
      </div>
    )}

    {isReaderLoading && (
      <div className="reader-floating-surface absolute right-3 top-3 z-30 rounded-full px-2.5 py-1 text-[11px] text-slate-700">
        Carregando dados...
      </div>
    )}
  </>
);
