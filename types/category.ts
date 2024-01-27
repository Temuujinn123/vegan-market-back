import mongoose from "mongoose";

export interface ICategory extends mongoose.Document {
    name: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

export interface ISubCategory extends mongoose.Document {
    name: string;
    parent_category_id?: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}
