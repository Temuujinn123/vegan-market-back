import mongoose from "mongoose";
import { ICompanyNotification } from "../types/companyNotification";

const CompanyNotificationSchema = new mongoose.Schema<ICompanyNotification>({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "CompanyUser",
        required: false,
    },
    content: {
        type: String,
        required: true,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    url: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        required: true,
    },
    updated_at: {
        type: Date,
        required: false,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

export default mongoose.model("CompanyNotification", CompanyNotificationSchema);
