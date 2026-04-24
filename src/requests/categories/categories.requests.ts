import { api } from '@/config/api';
import type { GetCategoriesQueryDto } from '@/dtos/categories/categories.request.dto';
import type { CategoriesResponseDto, CategoryResponseDto } from '@/dtos/categories/categories.response.dto';

export const getCategoriesRequest = (query?: GetCategoriesQueryDto): Promise<CategoriesResponseDto> =>
  api.get<CategoriesResponseDto>('/categories', { params: query }).then((r) => r.data);

export const getCategoryByIdRequest = (id: string): Promise<CategoryResponseDto> =>
  api.get<CategoryResponseDto>(`/categories/${id}`).then((r) => r.data);
