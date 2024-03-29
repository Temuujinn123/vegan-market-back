import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IAdminUser } from "../types/adminUser";

const AdminUserSchema = new mongoose.Schema<IAdminUser>({
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
    const salt: string = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

AdminUserSchema.methods.getJsonWebToken = function () {
    const token: string = jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET ?? "",
        {
            expiresIn: process.env.JWT_EXPIRESIN,
        }
    );

    return token;
};

AdminUserSchema.methods.checkPassword = async function (
    enteredPassword: string
) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("AdminUser", AdminUserSchema);
