import mongoose from "mongoose";

export interface ICategory extends mongoose.Document {
    name: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}
