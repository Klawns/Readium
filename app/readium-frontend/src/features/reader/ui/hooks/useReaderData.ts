import { useReaderAnnotationsData } from './useReaderAnnotationsData';
import { useReaderTranslationsData } from './useReaderTranslationsData';

export const useReaderData = (bookId: number, currentPage: number) => {
  const annotationData = useReaderAnnotationsData(bookId, currentPage);
  const translationData = useReaderTranslationsData(bookId);

  return {
    ...annotationData,
    ...translationData,
  };
};
