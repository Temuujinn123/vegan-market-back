import mongoose from "mongoose";
import { ICompanyCategory } from "../types/companyCategory";

const CompanyCategorySchema = new mongoose.Schema<ICompanyCategory>(
    {
        name: {
            type: String,
            required: [true, "Insert category name..."],
            unique: true,
            trim: true,
            max: [50, "Max length of category name is 50..."],
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

CompanyCategorySchema.virtual("products", {
    ref: "CompanyProduct",
    localField: "_id",
    foreignField: "category",
    justOne: false,
});

export default mongoose.model("CompanyCategory", CompanyCategorySchema);
