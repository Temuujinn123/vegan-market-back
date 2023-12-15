import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    phone_number: number;
    city: string;
    district: string;
    committ: string;
    address_detail: string;
    password: string;
    resetPasswordToken: string;
    resetPasswordExpire: Date;
    created_at: Date;
}
