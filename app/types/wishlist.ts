import mongoose from "mongoose";

export interface IWishlist extends mongoose.Document {
    user_id?: string;
    product_id?: string;
    created_at: Date;
}
