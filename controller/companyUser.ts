import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import MyError from "../utils/myError";
import SendMail from "../utils/mail";
import emailOptions from "../utils/mailer";
import asyncHandler from "../middleware/asyncHandler";
import Cart from "../models/Cart";
import { ICompanyUser } from "../types/companyUser";
import CompanyUser from "../models/CompanyUser";
import { generateRandomNumber } from "../utils/generateRandom";

export const register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        let { company_code }: { company_code: string | null } = req.body;

        if (company_code === null) {
            company_code = generateRandomNumber(7);
        }

        const user: ICompanyUser = await CompanyUser.create({
            ...req.body,
            company_code: parseInt(company_code),
        });

        const token: string = (user as any).getJsonWebToken();

        await Cart.create({
            user_id: user._id,
        });

        res.status(200).json({
            success: true,
            token,
            user,
        });
    }
);

export const login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new MyError("Please insert your email and password.", 400);
        }

        const user: ICompanyUser = await CompanyUser.findOne({ email }).select(
            "+password"
        );

        if (!user) {
            throw new MyError("Email or password's are incorrect.", 401);
        }

        const isOk = await (user as any).checkPassword(password);

        if (!isOk) {
            throw new MyError("Email or password's are incorrect.", 401);
        }

        res.status(200).json({
            success: true,
            token: (user as any).getJsonWebToken(),
        });
    }
);

export const getProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user) {
            throw new MyError("Can't find user.", 404);
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    }
);

export const updateProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const {
            address,
            name,
            phone_number,
        }: {
            address: string;
            name: string;
            phone_number: number;
        } = req.body;

        if (!_id) {
            throw new MyError("Can't find user", 404);
        }

        const user: ICompanyUser | null | undefined =
            await CompanyUser.findByIdAndUpdate(_id, {
                address,
                name,
                phone_number,
            });

        if (!user) {
            throw new MyError("Can't find user", 404);
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    }
);

function generateCode() {
    let code = "";
    let str =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 1; i <= 6; i++) {
        let char = Math.floor(Math.random() * str.length + 1);

        code += str.charAt(char);
    }

    return code;
}

export const forgetPassword = asyncHandler(
    async (req: Request, res: Response) => {
        const { email }: { email: string } = req.body;

        if (!email) {
            throw new MyError("Please insert your email.", 400);
        }

        const user: ICompanyUser | null = await CompanyUser.findOne({ email });

        if (!user) {
            throw new MyError("Can't find account with this email", 400);
        }

        const code: string = generateCode();

        const { success } = await SendMail(
            emailOptions(
                "temuuujinn8563@gmail.com",
                email,
                `Your code to change your account password is ${code}`,
                "Change password"
            ),
            (info: any) => {
                console.log("Email sent successfully");
                console.log("MESSAGE ID: ", info.messageId);
            }
        );

        if (success) {
            const result = await CompanyUser.findByIdAndUpdate(
                user._id,
                {
                    resetPasswordToken: code,
                    resetPasswordExpire: new Date(
                        new Date().setDate(new Date().getDate() + 1)
                    ),
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            res.status(200).json({ success: true });
        } else {
            res.status(200).json({ success: false });
        }
    }
);

export const checkChangePasswordCodeAndChangePassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            email,
            code,
            newPassword,
        }: {
            email: string | undefined;
            code: string | undefined;
            newPassword: string | undefined;
        } = req.body;

        if (!email || !code || !newPassword)
            throw new MyError(
                "Please insert your code to change your password",
                400
            );

        const user: any = await CompanyUser.findOne({ email }).select([
            "+resetPasswordToken",
            "+resetPasswordExpire",
        ]);

        if (!user) throw new MyError("Can't find account with this email", 400);

        if (
            code === user.resetPasswordToken &&
            new Date().getTime() < user.resetPasswordExpire.getTime()
        ) {
            const salt: string = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(newPassword, salt);

            await CompanyUser.findByIdAndUpdate(user._id, {
                password,
            });

            res.status(200).json({
                success: true,
            });
        } else {
            throw new MyError("Code is wrong", 400);
        }
    }
);

export const changePassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const {
            currentPassword,
            newPassword,
        }: { currentPassword: string; newPassword: string } = req.body;

        if (!currentPassword || !newPassword) {
            throw new MyError("Please insert your password", 400);
        }

        const user: any = await CompanyUser.findById(_id).select("+password");

        if (!user) {
            throw new MyError("Can't find user", 404);
        }

        const isMatch: boolean = await (user as any).checkPassword(
            currentPassword
        );

        if (!isMatch) {
            throw new MyError("Current password is wrong", 400);
        }

        const salt: string = await bcrypt.genSalt(10);
        const newHashedPassword: string = await bcrypt.hash(newPassword, salt);

        const changedUser = await CompanyUser.findByIdAndUpdate(_id, {
            password: newHashedPassword,
        });

        res.status(200).json({
            success: true,
            data: changedUser,
        });
    }
);
