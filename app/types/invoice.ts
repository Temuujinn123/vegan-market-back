import mongoose from "mongoose";

export interface IInvoice extends mongoose.Document {
    user_id: mongoose.Types.ObjectId;
    cart_id: mongoose.Types.ObjectId;
    amount: number;
    sender_invoice_no: string;
    invoice_receiver_code: string;
    extra_phone_number: number;
    is_paid: boolean;
    is_delivered: boolean;
    is_cancelled: boolean;
    is_refunded: boolean;
    method: "qpay" | "transfer";
    created_at: Date;
    updated_at: Date;
}
