/**
 * Standard API Response Interface
 */
export interface ApiResponse {
  status: number;
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

/**
 * Pagination Interface
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Paginated Response Interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

