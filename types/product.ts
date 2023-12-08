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

export interface IProduct extends mongoose.Document {
    name: string;
    img: string;
    price: number;
    desc: string;
    category?: string;
    created_at: Date;
    updated_at: Date | undefined | null;
    is_deleted: boolean;
}
