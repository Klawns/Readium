import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { CreateAnnotationCommand } from '../../domain/ports/AnnotationRepository';
import {
  createAnnotationUseCase,
  deleteAnnotationUseCase,
  getBookAnnotationsUseCase,
  getBookPageAnnotationsUseCase,
  updateAnnotationUseCase,
} from '../../application/use-cases/annotation-use-case-factory';
import { buildAnnotationPageWindow, mergePageAnnotations } from './useReaderAnnotationPages';

export const useReaderAnnotationsData = (bookId: number, currentPage: number) => {
  const queryClient = useQueryClient();
  const annotationPages = useMemo(() => buildAnnotationPageWindow(currentPage), [currentPage]);
  const allAnnotationsQueryKey = queryKeys.readerAnnotationsAll(bookId);

  const allAnnotationsQuery = useQuery({
    queryKey: allAnnotationsQueryKey,
    queryFn: () => getBookAnnotationsUseCase.execute(bookId),
    enabled: Number.isFinite(bookId) && bookId > 0,
    staleTime: 20_000,
    retry: 1,
  });

  const pageAnnotationsQueries = useQueries({
    queries: annotationPages.map((page) => ({
      queryKey: queryKeys.readerAnnotationsPage(bookId, page),
      queryFn: () => getBookPageAnnotationsUseCase.execute(bookId, page),
      enabled: Number.isFinite(bookId) && bookId > 0 && page > 0,
      staleTime: 10_000,
      retry: 1,
    })),
  });

  const invalidateBookAnnotations = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.readerAnnotationsRoot(bookId) });
  };

  const createAnnotationMutation = useMutation({
    mutationFn: (input: CreateAnnotationCommand) => createAnnotationUseCase.execute(input),
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
