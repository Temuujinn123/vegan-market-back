import mongoose from "mongoose";

export interface ICompanyUser extends mongoose.Document {
    company_name: string;
    email: string;
    company_code: number;
    phone_number: number;
    address: string | null;
    password: string;
    resetPasswordToken: string;
    resetPasswordExpire: Date;
    created_at: Date;
}
