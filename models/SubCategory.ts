import mongoose from "mongoose";
import { ISubCategory } from "../types/category";

const SubCategorySchema = new mongoose.Schema<ISubCategory>(
    {
        name: {
            type: String,
            required: [true, "Insert category name..."],
            unique: true,
            trim: true,
            max: [50, "Max length of category name is 50..."],
        },
        parent_category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Insert parent category..."],
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

SubCategorySchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "category",
    justOne: false,
});

export default mongoose.model("SubCategory", SubCategorySchema);
