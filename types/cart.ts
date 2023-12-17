import mongoose from "mongoose";

export interface ICart extends mongoose.Document {
    user_id?: string;
    product_id?: string;
    quantity: number;
    created_at: Date;
}
