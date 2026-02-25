import type {
  AnnotationRepository,
  CreateAnnotationCommand,
  UpdateAnnotationCommand,
} from '../../domain/ports/AnnotationRepository';

export class GetBookAnnotationsUseCase {
  constructor(private readonly repository: AnnotationRepository) {}

  execute(bookId: number) {
    return this.repository.getByBook(bookId);
  }
}

export class GetBookPageAnnotationsUseCase {
  constructor(private readonly repository: AnnotationRepository) {}

  execute(bookId: number, page: number) {
    return this.repository.getByBookAndPage(bookId, page);
  }
}

export class CreateAnnotationUseCase {
  constructor(private readonly repository: AnnotationRepository) {}

  execute(command: CreateAnnotationCommand) {
    return this.repository.create(command);
  }
}

export class UpdateAnnotationUseCase {
  constructor(private readonly repository: AnnotationRepository) {}

  execute(command: UpdateAnnotationCommand) {
    return this.repository.update(command);
  }
}

export class DeleteAnnotationUseCase {
  constructor(private readonly repository: AnnotationRepository) {}

  execute(id: number) {
    return this.repository.delete(id);
  }
}
