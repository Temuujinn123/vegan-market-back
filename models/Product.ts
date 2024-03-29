import mongoose from "mongoose";
import { IProduct } from "../types/product";

const ProductSchema = new mongoose.Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, "Insert your product name..."],
            unique: false,
            trim: true,
            max: [250, "Max length of product name is 250..."],
        },
        price: {
            type: Number,
            required: [true, "Insert price of the product..."],
        },
        stock: {
            type: Number,
            required: [true, "Insert stock of the product..."],
        },
        storage_duration: {
            type: Number,
            required: [true, "Insert storage duration of the product..."],
        },
        made_in_country: {
            type: String,
            required: [true, "Insert made in country of the product..."],
        },
        weight: {
            type: String,
            required: [true, "Insert weight of the product..."],
        },
        is_sale: {
            type: Boolean,
            default: false,
        },
        sale_price: {
            type: Number,
        },
        sale_start_date: {
            type: Date,
        },
        sale_end_date: {
            type: Date,
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
        sub_category: {
            type: mongoose.Schema.ObjectId,
            ref: "SubCategory",
            required: false,
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
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

ProductSchema.virtual("img", {
    ref: "Files",
    localField: "_id",
    foreignField: "product_id",
    justOne: false,
});

export default mongoose.model("Product", ProductSchema);
