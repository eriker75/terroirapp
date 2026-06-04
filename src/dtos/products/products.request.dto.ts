// Orden del catálogo, espejo de ProductSort del backend.
export type ProductSort =
  | 'featured'
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc';

// Filtros del catálogo público (`GET /api/products`). Coinciden con
// FilterProductsDto del backend: el ValidationPipe usa forbidNonWhitelisted,
// así que solo se envían estos parámetros.
export interface GetProductsQueryDto {
  limit?: number;
  offset?: number;
  /** Búsqueda por nombre o descripción. */
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minPoints?: number;
  maxPoints?: number;
  /** Nivel de tueste (atributo). */
  roast?: string;
  /** Origen (atributo). */
  origin?: string;
  /** Slug de la etiqueta. */
  tag?: string;
  /** Solo productos con stock disponible. */
  inStock?: boolean;
  sort?: ProductSort;
}
