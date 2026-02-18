import React from 'react';
import { useParams } from 'react-router-dom';
import PdfReader from '@/features/reader/components/PdfReader.tsx';
import { useReaderBook } from '@/features/reader/ui/hooks/useReaderBook';

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = Number(id);
  const {
    book,
    isLoading,
    hasError,
    ocrStatus,
    ocrScore,
    fileUrl,
    onStatusChange,
    onTriggerOcr,
    isTriggeringOcr,
  } = useReaderBook(bookId);

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Carregando livro...</span>
      </div>
    );
  }

  if (hasError || !book) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <span className="text-sm text-destructive">Erro ao carregar livro.</span>
      </div>
    );
  }

  if (book.format !== 'PDF') {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Formato nao suportado pelo leitor de PDF.</span>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-gray-100">
      <PdfReader
        fileUrl={fileUrl}
        bookId={bookId}
        initialPage={book.lastReadPage || 1}
        bookStatus={book.status}
        onStatusChange={onStatusChange}
        totalPages={book.pages || 0}
        ocrStatus={ocrStatus?.status}
        ocrScore={ocrScore}
        onTriggerOcr={onTriggerOcr}
        isTriggeringOcr={isTriggeringOcr}
      />
    </div>
  );
}
