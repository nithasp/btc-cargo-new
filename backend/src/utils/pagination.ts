import { Paged, PageRequest, Pagination } from '../types/pagination.types';

export function toPagination(page: PageRequest, total: number): Pagination {
  return {
    page: page.page,
    pageSize: page.pageSize,
    startPage: 1,
    endPage: Math.max(1, Math.ceil(total / page.pageSize)),
    records: total,
  };
}

export async function paged<T>(
  page: PageRequest,
  list: () => Promise<T[]>,
  count: () => Promise<number>,
): Promise<Paged<T>> {
  const [records, total] = await Promise.all([list(), count()]);
  return { records, pagination: toPagination(page, total) };
}
