import mongoose from "mongoose";

export interface ICart extends mongoose.Document {
    user_id?: string;
    is_bought: boolean;
    total_price: number;
    total_quantity: number;
    created_at: Date;
}

export interface ICartItem extends mongoose.Document {
    cart_id?: string;
    product_id?: string;
    quantity: number;
    created_at: Date;
}
