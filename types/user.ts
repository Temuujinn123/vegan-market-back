export interface IUser {
    name: string;
    email: string;
    phone_number: number;
    password: string;
    resetPasswordToken: string;
    resetPasswordExpire: Date;
    created_at: Date;
}
