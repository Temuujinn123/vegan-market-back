import mongoose from "mongoose";
import { ICart, ICartItem } from "../types/cart";

const CartItemSchema = new mongoose.Schema<ICartItem>(
    {
        cart_id: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        product_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: false,
            default: 1,
        },
        created_at: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

CartItemSchema.virtual("product", {
    ref: "Product",
    localField: "product_id",
    foreignField: "_id",
    justOne: true,
});

export default mongoose.model("CartItem", CartItemSchema);
