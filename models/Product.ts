import mongoose from "mongoose";
import { IProduct } from "../types/product";

const ProductSchema = new mongoose.Schema<IProduct>({
    name: {
        type: String,
        required: [true, "Insert your product name..."],
        unique: true,
        trim: true,
        max: [250, "Max length of product name is 250..."],
    },
    img: {
        type: String,
        default: "no_photo.jpg",
    },
    price: {
        type: Number,
        required: [true, "Insert price of the product..."],
    },
    desc: {
        type: String,
        required: [true, "Description of the product..."],
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: [true, "Insert category of the product..."],
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
});

export default mongoose.model("Product", ProductSchema);
