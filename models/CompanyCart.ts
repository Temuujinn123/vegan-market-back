import mongoose from "mongoose";
import { ICompanyCart } from "../types/companyCart";

const CompanyCartSchema = new mongoose.Schema<ICompanyCart>(
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

CompanyCartSchema.virtual("cart_item", {
    ref: "CompanyCartItem",
    localField: "_id",
    foreignField: "cart_id",
    justOne: false,
});

export default mongoose.model("CompanyCart", CompanyCartSchema);
