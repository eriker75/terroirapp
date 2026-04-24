export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

/** Forma exacta que devuelve el backend en listados paginados */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginationQueryDto {
  limit?: number;
  offset?: number;
}
