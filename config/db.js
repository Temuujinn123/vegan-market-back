"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    var _a;
    const conn = await mongoose_1.default.connect((_a = process.env.MONGODB_URI) !== null && _a !== void 0 ? _a : "", {});
    console.log(`MongoDB connected: ${conn.connection.host}`);
};
exports.default = connectDB;
