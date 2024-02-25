import mongoose from "mongoose";

export interface ICompanyUser extends mongoose.Document {
    company_name: string;
    email: string;
    phone_number: number;
    city: string | null;
    district: string | null;
    committ: string | null;
    address_detail: string | null;
    password: string;
    resetPasswordToken: string;
    resetPasswordExpire: Date;
    created_at: Date;
}
