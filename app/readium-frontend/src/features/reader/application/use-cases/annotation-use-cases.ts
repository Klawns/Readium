import type {
  AnnotationRepository,
  CreateAnnotationCommand,
  UpdateAnnotationCommand,
} from '../../domain/ports/AnnotationRepository';

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
