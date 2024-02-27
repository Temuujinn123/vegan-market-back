import mongoose from "mongoose";
import { ICompanyProduct } from "./companyProduct";

export interface ICompanyCart extends mongoose.Document {
    user_id?: string;
    is_bought: boolean;
    total_price: number;
    total_quantity: number;
    created_at: Date;
}

export interface ICompanyCartItem extends mongoose.Document {
    cart_id?: string;
    product_id?: string;
    quantity: number;
    product?: ICompanyProduct;
    created_at: Date;
}
