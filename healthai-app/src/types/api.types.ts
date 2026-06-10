// Types génériques pour les réponses API
export type ApiResponse<T> = {
  data: T;
  message: string;
  status: number;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  total: number;
  page: number;
  perPage: number;
};
