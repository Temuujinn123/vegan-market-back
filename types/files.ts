import mongoose from "mongoose";

export interface IFiles extends mongoose.Document {
    name: string;
    product_id: mongoose.ObjectId;
    url: string;
    created_at: Date;
}
//
