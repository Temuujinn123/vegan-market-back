import mongoose from "mongoose";
import { IInvoice } from "../types/invoice";

const InvoiceSchema = new mongoose.Schema<IInvoice>(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cart_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        sender_invoice_no: {
            type: String,
            required: true,
        },
        invoice_receiver_code: {
            type: String,
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
        method: {
            type: String,
            required: true,
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

InvoiceSchema.virtual("cart", {
    ref: "Cart",
    localField: "cart_id",
    foreignField: "_id",
    justOne: true,
});

InvoiceSchema.virtual("user", {
    ref: "User",
    localField: "user_id",
    foreignField: "_id",
    justOne: true,
});

export default mongoose.model("Invoice", InvoiceSchema);
