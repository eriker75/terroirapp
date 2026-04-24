import type { Product } from '@/types/product.types';
import type { PaginatedResponse } from '@/types/api.types';

export type ProductsResponseDto = PaginatedResponse<Product>;
export type ProductResponseDto = Product;
