import mongoose from "mongoose";
import { ICart } from "../types/cart";

const CartSchema = new mongoose.Schema<ICart>(
    {
        user_id: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        is_bought: {
            type: Boolean,
            required: false,
            default: false,
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

CartSchema.virtual("cart_item", {
    ref: "CartItem",
    localField: "_id",
    foreignField: "cart_id",
    justOne: false,
});

export default mongoose.model("Cart", CartSchema);
