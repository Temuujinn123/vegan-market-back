import mongoose from "mongoose";

export interface IFiles extends mongoose.Document {
    name: string;
    product_id: mongoose.ObjectId;
    url: string;
    is_deleted: boolean;
    deleted_by: string;
    created_at: Date;
}
