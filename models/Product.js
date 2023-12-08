"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ProductSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Insert your product name..."],
        unique: true,
        trim: true,
        max: [250, "Max length of product name is 250..."],
    },
    img: {
        type: String,
        default: "no_photo.jpg",
    },
    price: {
        type: Number,
        required: [true, "Insert price of the product..."],
    },
    desc: {
        type: String,
        required: [true, "Description of the product..."],
    },
    category: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: "Category",
        required: [true, "Insert category of the product..."],
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
});
exports.default = mongoose_1.default.model("Product", ProductSchema);
