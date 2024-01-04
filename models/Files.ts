import mongoose from "mongoose";
import { IFiles } from "../types/files";

const FilesSchema = new mongoose.Schema<IFiles>(
    {
        name: {
            type: String,
            required: [true, "Insert category name..."],
            unique: true,
            trim: true,
            max: [50, "Max length of category name is 50..."],
        },
        product_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: [true],
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
