import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
    content: string;
    user_id?: string;
    is_read: boolean;
    url?: string;
    updated_at: Date;
    created_at: Date;
}
