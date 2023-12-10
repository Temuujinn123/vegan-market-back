import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import MyError from "../utils/myError";
import { IUser } from "../types/user";
import User from "../models/User";
import SendMail from "../utils/mail";
import emailOptions from "../utils/mailer";
import asyncHandler from "../middleware/asyncHandler";

export const register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const user: IUser = await User.create(req.body);

        const token: string = (user as any).getJsonWebToken();

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

        const user: IUser = await User.findOne({ email }).select("+password");

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

        const user: IUser | null = await User.findOne({ email });

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
            const result = await User.findByIdAndUpdate(
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

            console.log("result ===========> ", result);

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

        const user: any = await User.findOne({ email }).select([
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

            await User.findByIdAndUpdate(user._id, {
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
