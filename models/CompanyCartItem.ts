import mongoose from "mongoose";
import { ICompanyCartItem } from "../types/companyCart";

const CompanyCartItemSchema = new mongoose.Schema<ICompanyCartItem>(
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

CompanyCartItemSchema.virtual("product", {
    ref: "CompanyProduct",
    localField: "product_id",
    foreignField: "_id",
    justOne: true,
});

export default mongoose.model("CompanyCartItem", CompanyCartItemSchema);
