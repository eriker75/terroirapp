import type { BackendProduct } from '@/lib/product-mapper';
import type { PaginatedResponse } from '@/types/api.types';

export type ProductsResponseDto = PaginatedResponse<BackendProduct>;
export type ProductResponseDto = BackendProduct;
