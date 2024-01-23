import mongoose from "mongoose";

export interface IBannerFile extends mongoose.Document {
    name: string;
    created_at: Date;
}
