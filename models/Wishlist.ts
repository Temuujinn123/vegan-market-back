import mongoose from "mongoose";
import { IWishlist } from "../types/wishlist";

const WishlistSchema = new mongoose.Schema<IWishlist>({
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
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

export default mongoose.model("Wishlist", WishlistSchema);
