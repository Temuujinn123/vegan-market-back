"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AdminUserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please insert your name."],
    },
    email: {
        type: String,
        required: [true, "Please insert your email."],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Email is incorrect",
        ],
    },
    password: {
        type: String,
        minLength: 4,
        required: [true, "Please insert your password."],
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    created_at: {
        type: Date,
        default: Date.now(),
    },
});
AdminUserSchema.pre("save", async function () {
    const salt = await bcrypt_1.default.genSalt(10);
    this.password = await bcrypt_1.default.hash(this.password, salt);
});
AdminUserSchema.methods.getJsonWebToken = function () {
    var _a;
    const token = jsonwebtoken_1.default.sign({ id: this._id }, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "", {
        expiresIn: process.env.JWT_EXPIRESIN,
    });
    return token;
};
AdminUserSchema.methods.checkPassword = async function (enteredPassword) {
    return await bcrypt_1.default.compare(enteredPassword, this.password);
};
exports.default = mongoose_1.default.model("AdminUser", AdminUserSchema);
