import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import MyError from "../utils/myError";
import { IUser } from "../types/user";
import User from "../models/User";

export const register = expressAsyncHandler(
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

export const login = expressAsyncHandler(
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
