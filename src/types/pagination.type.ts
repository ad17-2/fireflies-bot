import { WebResponse } from "./response.type";

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginatedResponse<T> extends WebResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface ValidatedPagination {
  page: number;
  limit: number;
}
