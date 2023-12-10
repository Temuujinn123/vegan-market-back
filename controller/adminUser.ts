import { NextFunction, Request, Response } from "express";
import MyError from "../utils/myError";
import { IAdminUser } from "../types/adminUser";
import AdminUser from "../models/AdminUser";
import asyncHandler from "../middleware/asyncHandler";

export const register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const adminUser: IAdminUser = await AdminUser.create(req.body);

        const token: string = (adminUser as any).getJsonWebToken();

        res.status(200).json({
            success: true,
            token,
            adminUser,
        });
    }
);

export const login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new MyError("Please insert your email and password.", 400);
        }

        const adminUser: IAdminUser = await AdminUser.findOne({ email }).select(
            "+password"
        );

        if (!adminUser) {
            throw new MyError("Email or password's are incorrect.", 401);
        }

        const isOk = await (adminUser as any).checkPassword(password);

        if (!isOk) {
            throw new MyError("Email or password's are incorrect.", 401);
        }

        res.status(200).json({
            success: true,
            token: (adminUser as any).getJsonWebToken(),
        });
    }
);
