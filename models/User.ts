import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUser } from "../types/user";

const UserSchema = new mongoose.Schema<IUser>({
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
    phone_number: {
        type: Number,
        required: [true, "Please insert your phone number."],
    },
    password: {
        type: String,
        minLength: 4,
        required: [true, "Please insert your password."],
        select: false,
    },
    resetPasswordToken: {
        type: String,
        required: false,
        select: false,
        default: "",
    },
    resetPasswordExpire: {
        type: Date,
        required: false,
        select: false,
        default: Date.now(),
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

UserSchema.pre("save", async function () {
    const salt: string = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getJsonWebToken = function () {
    const token: string = jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET ?? "",
        {
            expiresIn: process.env.JWT_EXPIRESIN,
        }
    );

    return token;
};

UserSchema.methods.checkPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
