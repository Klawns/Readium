import { AnnotationHttpRepository } from '../../infrastructure/api/annotation-http-repository';
import { AnnotationOfflineRepository } from '../../infrastructure/offline/annotation-offline-repository';
import {
  CreateAnnotationUseCase,
  DeleteAnnotationUseCase,
  GetBookAnnotationsUseCase,
  GetBookPageAnnotationsUseCase,
  UpdateAnnotationUseCase,
} from './annotation-use-cases';

const annotationRepository = new AnnotationOfflineRepository(new AnnotationHttpRepository());

export const getBookAnnotationsUseCase = new GetBookAnnotationsUseCase(annotationRepository);
export const getBookPageAnnotationsUseCase = new GetBookPageAnnotationsUseCase(annotationRepository);
export const createAnnotationUseCase = new CreateAnnotationUseCase(annotationRepository);
export const updateAnnotationUseCase = new UpdateAnnotationUseCase(annotationRepository);
export const deleteAnnotationUseCase = new DeleteAnnotationUseCase(annotationRepository);
