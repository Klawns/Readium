import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReaderRect } from '../../domain/models';
import { AnnotationHttpRepository } from '../../infrastructure/api/annotation-http-repository';
import {
  CreateAnnotationUseCase,
  DeleteAnnotationUseCase,
  UpdateAnnotationUseCase,
} from '../../application/use-cases/annotation-use-cases';
import { buildAnnotationPageWindow, mergePageAnnotations } from './useReaderAnnotationPages';

const annotationRepository = new AnnotationHttpRepository();
const createAnnotationUseCase = new CreateAnnotationUseCase(annotationRepository);
const updateAnnotationUseCase = new UpdateAnnotationUseCase(annotationRepository);
const deleteAnnotationUseCase = new DeleteAnnotationUseCase(annotationRepository);

export interface CreateReaderAnnotationInput {
  bookId: number;
  page: number;
  rects: ReaderRect[];
  color: string;
  selectedText: string;
  note?: string;
}

export const useReaderAnnotationsData = (bookId: number, currentPage: number) => {
  const queryClient = useQueryClient();
  const annotationPages = useMemo(() => buildAnnotationPageWindow(currentPage), [currentPage]);
  const allAnnotationsQueryKey = ['reader', 'annotations', bookId, 'all'] as const;

  const allAnnotationsQuery = useQuery({
    queryKey: allAnnotationsQueryKey,
    queryFn: () => annotationRepository.getByBook(bookId),
    enabled: Number.isFinite(bookId) && bookId > 0,
    staleTime: 20_000,
    retry: 1,
  });

  const pageAnnotationsQueries = useQueries({
    queries: annotationPages.map((page) => ({
      queryKey: ['reader', 'annotations', bookId, 'page', page] as const,
      queryFn: () => annotationRepository.getByBookAndPage(bookId, page),
      enabled: Number.isFinite(bookId) && bookId > 0 && page > 0,
      staleTime: 10_000,
      retry: 1,
    })),
  });

  const invalidateBookAnnotations = () => {
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === 'reader'
        && queryKey[1] === 'annotations'
        && queryKey[2] === bookId,
    });
  };

  const createAnnotationMutation = useMutation({
    mutationFn: (input: CreateReaderAnnotationInput) => createAnnotationUseCase.execute(input),
    onSuccess: invalidateBookAnnotations,
  });

  const updateAnnotationMutation = useMutation({
    mutationFn: updateAnnotationUseCase.execute.bind(updateAnnotationUseCase),
    onSuccess: invalidateBookAnnotations,
  });

  const deleteAnnotationMutation = useMutation({
    mutationFn: deleteAnnotationUseCase.execute.bind(deleteAnnotationUseCase),
    onSuccess: invalidateBookAnnotations,
  });

  const pageAnnotations = useMemo(() => {
    const currentPageIndex = annotationPages.findIndex((page) => page === currentPage);
    if (currentPageIndex < 0) {
      return [];
    }
    return pageAnnotationsQueries[currentPageIndex]?.data ?? [];
  }, [annotationPages, pageAnnotationsQueries, currentPage]);

  const annotations = useMemo(
    () => mergePageAnnotations(pageAnnotationsQueries.map((query) => query.data)),
    [pageAnnotationsQueries],
  );

  return {
    allAnnotations: allAnnotationsQuery.data ?? [],
    annotations,
    pageAnnotations,
    isPageLoading: pageAnnotationsQueries.some((query) => query.isLoading),
    createAnnotation: createAnnotationMutation.mutateAsync,
    updateAnnotation: updateAnnotationMutation.mutateAsync,
    deleteAnnotation: deleteAnnotationMutation.mutateAsync,
  };
};

