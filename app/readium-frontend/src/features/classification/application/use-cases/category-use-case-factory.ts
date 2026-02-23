import { CategoryHttpRepository } from '../../infrastructure/api/category-http-repository';
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  ListBookCategoriesUseCase,
  ListCategoriesUseCase,
  MoveCategoryUseCase,
  SetBookCategoriesUseCase,
  UpdateCategoryUseCase,
} from './category-use-cases';

const categoryRepository = new CategoryHttpRepository();

export const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);
export const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
export const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
export const moveCategoryUseCase = new MoveCategoryUseCase(categoryRepository);
export const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);
export const listBookCategoriesUseCase = new ListBookCategoriesUseCase(categoryRepository);
export const setBookCategoriesUseCase = new SetBookCategoriesUseCase(categoryRepository);
