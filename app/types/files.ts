import mongoose from "mongoose";

export interface IFiles extends mongoose.Document {
    name: string;
    product_id: mongoose.ObjectId;
    created_at: Date;
}
