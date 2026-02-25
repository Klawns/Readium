import {
  getConnectionMode,
  type ConnectionMode,
} from '@/features/preferences/application/services/connection-mode-service.ts';
import { CategoryHttpRepository } from '../../infrastructure/api/category-http-repository';
import { CategoryLocalRepository } from '../../infrastructure/local/category-local-repository';
import type { CategoryRepository } from '../../domain/ports/CategoryRepository';
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  ListBookCategoriesUseCase,
  ListCategoriesUseCase,
  MoveCategoryUseCase,
  SetBookCategoriesUseCase,
  UpdateCategoryUseCase,
} from './category-use-cases';

export interface CategoryUseCases {
  listCategoriesUseCase: ListCategoriesUseCase;
  createCategoryUseCase: CreateCategoryUseCase;
  updateCategoryUseCase: UpdateCategoryUseCase;
  moveCategoryUseCase: MoveCategoryUseCase;
  deleteCategoryUseCase: DeleteCategoryUseCase;
  listBookCategoriesUseCase: ListBookCategoriesUseCase;
  setBookCategoriesUseCase: SetBookCategoriesUseCase;
}

const useCasesByMode = new Map<ConnectionMode, CategoryUseCases>();

const createUseCases = (repository: CategoryRepository): CategoryUseCases => ({
  listCategoriesUseCase: new ListCategoriesUseCase(repository),
  createCategoryUseCase: new CreateCategoryUseCase(repository),
  updateCategoryUseCase: new UpdateCategoryUseCase(repository),
  moveCategoryUseCase: new MoveCategoryUseCase(repository),
  deleteCategoryUseCase: new DeleteCategoryUseCase(repository),
  listBookCategoriesUseCase: new ListBookCategoriesUseCase(repository),
  setBookCategoriesUseCase: new SetBookCategoriesUseCase(repository),
});

const resolveRepositoryForMode = (mode: ConnectionMode): CategoryRepository =>
  mode === 'LOCAL' ? new CategoryLocalRepository() : new CategoryHttpRepository();

export const getCategoryUseCases = (): CategoryUseCases => {
  const mode = getConnectionMode();
  const existing = useCasesByMode.get(mode);
  if (existing) {
    return existing;
  }

  const created = createUseCases(resolveRepositoryForMode(mode));
  useCasesByMode.set(mode, created);
  return created;
};
