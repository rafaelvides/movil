export interface IPagination {
  total: number;
  totalPag: number;
  currentPag: number;
  nextPag: number;
  prevPag: number;
  status: number;
  ok: boolean;
}

export interface PaginationProps{
  totalPages: number;
  onPageChange: (pageNumber: number ) => void
  nextPage: number;
  previousPage:number;
  currentPage:number;
}
