export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  headers?: Record<string, string>;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
};

export type ApiResponse<T> = {
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
  current_page: number;
  data: T[];
};
