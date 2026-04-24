import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getCategoriesRequest, getCategoryByIdRequest } from '@/requests/categories/categories.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { GetCategoriesQueryDto } from '@/dtos/categories/categories.request.dto';
import type { CategoriesResponseDto, CategoryResponseDto } from '@/dtos/categories/categories.response.dto';

export function useCategoriesQuery(query?: GetCategoriesQueryDto) {
  return useQuery<CategoriesResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.CATEGORIES.LIST(query),
    queryFn: () => getCategoriesRequest(query),
  });
}

export function useCategoryQuery(id: string) {
  return useQuery<CategoryResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.CATEGORIES.DETAIL(id),
    queryFn: () => getCategoryByIdRequest(id),
    enabled: !!id,
  });
}
