export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
}

export interface SuccessResponse<T = any> {
  status: 'success';
  data: T;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;
