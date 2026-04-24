import { api } from '@/config/api';
import type { GetProductsQueryDto } from '@/dtos/products/products.request.dto';
import type { ProductsResponseDto, ProductResponseDto } from '@/dtos/products/products.response.dto';

export const getProductsRequest = (query?: GetProductsQueryDto): Promise<ProductsResponseDto> =>
  api.get<ProductsResponseDto>('/products', { params: query }).then((r) => r.data);

export const getProductByIdRequest = (id: string): Promise<ProductResponseDto> =>
  api.get<ProductResponseDto>(`/products/${id}`).then((r) => r.data);
