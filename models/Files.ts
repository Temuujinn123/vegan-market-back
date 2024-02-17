import mongoose from "mongoose";
import { IFiles } from "../types/files";

const FilesSchema = new mongoose.Schema<IFiles>(
    {
        name: {
            type: String,
            required: [true, "Insert file name..."],
            unique: true,
            trim: true,
        },
        url: {
            type: String,
            required: [false, "Insert file url..."],
            unique: true,
            trim: true,
        },
        product_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: [true],
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
        deleted_by: {
            type: String,
            default: null,
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

export default mongoose.model("Files", FilesSchema);
