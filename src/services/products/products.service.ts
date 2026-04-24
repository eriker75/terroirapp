import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getProductsRequest, getProductByIdRequest } from '@/requests/products/products.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { GetProductsQueryDto } from '@/dtos/products/products.request.dto';
import type { ProductsResponseDto, ProductResponseDto } from '@/dtos/products/products.response.dto';

export function useProductsQuery(query?: GetProductsQueryDto) {
  return useQuery<ProductsResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.PRODUCTS.LIST(query),
    queryFn: () => getProductsRequest(query),
  });
}

export function useProductQuery(id: string) {
  return useQuery<ProductResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.PRODUCTS.DETAIL(id),
    queryFn: () => getProductByIdRequest(id),
    enabled: !!id,
  });
}
