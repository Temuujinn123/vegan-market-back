import mongoose from "mongoose";

export interface ICompanyInvoice extends mongoose.Document {
    user_id: mongoose.Types.ObjectId;
    cart_id: mongoose.Types.ObjectId;
    amount: number;
    invoice_no: number;
    sender_invoice_no: string;
    extra_phone_number: number;
    is_paid: boolean;
    is_delivered: boolean;
    is_cancelled: boolean;
    is_refunded: boolean;
    created_at: Date;
    updated_at: Date;
}
