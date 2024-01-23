import mongoose from "mongoose";
import { IBannerFile } from "../types/bannerFiles";

const BannerFilesSchema = new mongoose.Schema<IBannerFile>({
    name: {
        type: String,
        unique: true,
        trim: true,
        max: [50, "Max length of banner file name is 50..."],
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

export default mongoose.model("BannerFiles", BannerFilesSchema);
