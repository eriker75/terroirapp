import type { Category } from '@/types/category.types';
import type { PaginatedResponse } from '@/types/api.types';

export type CategoryResponseDto = Category;
export type CategoriesResponseDto = PaginatedResponse<Category>;
