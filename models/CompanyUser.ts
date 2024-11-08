import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ICompanyUser } from "../types/companyUser";

const CompanyUserSchema = new mongoose.Schema<ICompanyUser>({
    company_name: {
        type: String,
        required: [true, "Please insert your company name."],
    },
    email: {
        type: String,
        required: false,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Email is incorrect",
        ],
    },
    company_code: {
        type: Number,
        length: 7,
        required: true,
    },
    phone_number: {
        type: Number,
        required: [true, "Please insert your phone number."],
        default: null,
    },
    address: {
        type: String,
        required: false,
        default: null,
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

CompanyUserSchema.methods.getJsonWebToken = function () {
    const token: string = jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET ?? "",
        {
            expiresIn: process.env.JWT_EXPIRESIN,
        }
    );

    return token;
};

CompanyUserSchema.methods.checkPassword = async function (
    enteredPassword: string
) {
    return enteredPassword === this.password;
};

export default mongoose.model("CompanyUser", CompanyUserSchema);
