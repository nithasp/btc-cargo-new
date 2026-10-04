export interface PageRequest {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  startPage: number;
  endPage: number;
  records: number;
}

export interface Paged<T> {
  records: T[];
  pagination: Pagination;
}
