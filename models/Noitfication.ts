import mongoose from "mongoose";
import { INotification } from "../types/notification";

const NotificationSchema = new mongoose.Schema<INotification>({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
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

export default mongoose.model("Notification", NotificationSchema);
