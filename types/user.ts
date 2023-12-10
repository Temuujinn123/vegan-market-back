import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    phone_number: number;
    password: string;
    resetPasswordToken: string;
    resetPasswordExpire: Date;
    created_at: Date;
}
