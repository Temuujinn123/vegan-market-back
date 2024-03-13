import mongoose from "mongoose";

export interface PaginationDto {
    nextPage?: number;
    prevPage?: number;
    total: number;
    pageCount: number;
    start: number;
    end: number;
    limit: number;
}

export interface ICompanyProduct extends mongoose.Document {
    name: string;
    img: string;
    bar_code: number;
    price: number;
    storage_duration: number;
    stock: number;
    made_in_country: string;
    weight: string;
    is_sale: boolean;
    sale_price: number;
    sale_start_date: Date | undefined | null;
    sale_end_date: Date | undefined | null;
    desc: string;
    category?: string;
    created_at: Date;
    updated_at: Date | undefined | null;
    is_deleted: boolean;
}
