import mongoose from "mongoose";
import { ICart } from "../types/cart";

const CartSchema = new mongoose.Schema<ICart>(
    {
        user_id: {
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

CartSchema.virtual("product", {
    ref: "Product",
    localField: "product_id",
    foreignField: "_id",
    justOne: true,
});

export default mongoose.model("Cart", CartSchema);
