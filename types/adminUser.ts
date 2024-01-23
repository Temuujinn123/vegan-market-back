import mongoose from "mongoose";

export interface IAdminUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    resetPasswordToken: string;
    resetPasswordExpire: Date;
    created_at: Date;
}
