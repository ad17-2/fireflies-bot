import { PaginationQuery, ValidatedPagination } from "../types/pagination.type";

export const validatePagination = (
  query: PaginationQuery,
  options?: {
    maxLimit?: number;
    defaultLimit?: number;
    defaultPage?: number;
  }
): ValidatedPagination => {
  const { maxLimit = 100, defaultLimit = 10, defaultPage = 1 } = options || {};

  const validatedPage = Math.max(
    defaultPage,
    parseInt(query.page || String(defaultPage))
  );

  const validatedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit || String(defaultLimit)))
  );

  return {
    page: validatedPage,
    limit: validatedLimit,
  };
};
