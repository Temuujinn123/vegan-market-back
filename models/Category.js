"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CategorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Insert category name..."],
        unique: true,
        trim: true,
        max: [50, "Max length of category name is 50..."],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
CategorySchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "category",
    justOne: false,
});
exports.default = mongoose_1.default.model("Category", CategorySchema);
