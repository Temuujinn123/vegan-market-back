import mongoose from "mongoose";

interface IProduct extends mongoose.Document {
    name: string;
    img: string;
    price: number;
    desc: string;
    category: string;
    created_at: Date;
    updated_at: Date | undefined | null;
    is_deleted: boolean;
}

const ProductSchema = new mongoose.Schema<IProduct>({
    name: {
        type: String,
        required: [true, "Insert your product name..."],
        unique: true,
        trim: true,
        max: [250, "Max length of product name is 250..."]
    },
    img: {
        type: String,
        default: "no_photo.jpg"
    },
    price: {
        type: Number,
        required: [true, "Insert price of the product..."]
    },
    desc: {
        type: String,
        required: [true, "Description of the product..."]
    },
    category: {
        type: String,
        ref: "Product",
        required: [true, "Insert category of the product..."]
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
})

export default mongoose.model("Product", ProductSchema)