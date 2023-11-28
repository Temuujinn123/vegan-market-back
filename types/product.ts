export interface PaginationDto {
    nextPage?: number;
    prevPage?: number;
    total: number;
    pageCount: number;
    start: number;
    end: number;
    limit: number;
}
