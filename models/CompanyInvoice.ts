import mongoose from "mongoose";
import { ICompanyInvoice } from "../types/companyInvoice";

const CompanyInvoiceSchema = new mongoose.Schema<ICompanyInvoice>(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompanyUser",
            required: true,
        },
        cart_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompanyCart",
            required: true,
        },
        invoice_no: {
            type: Number,
            unique: true,
            default: 1,
        },
        sender_invoice_no: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        extra_phone_number: {
            type: Number,
            required: false,
        },
        is_paid: {
            type: Boolean,
            default: false,
        },
        is_delivered: {
            type: Boolean,
            default: false,
        },
        is_cancelled: {
            type: Boolean,
            default: false,
        },
        is_refunded: {
            type: Boolean,
            default: false,
        },
        updated_at: {
            type: Date,
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

CompanyInvoiceSchema.virtual("cart", {
    ref: "CompanyCart",
    localField: "cart_id",
    foreignField: "_id",
    justOne: true,
});

CompanyInvoiceSchema.virtual("user", {
    ref: "CompanyUser",
    localField: "user_id",
    foreignField: "_id",
    justOne: true,
});

export default mongoose.model("CompanyInvoice", CompanyInvoiceSchema);
