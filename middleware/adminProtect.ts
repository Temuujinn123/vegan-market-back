import MyError from "../utils/myError";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler";
import AdminUser from "../models/AdminUser";

export const adminProtect = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.authorization) {
            throw new MyError("Please login first.", 401);
        }

        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            throw new MyError("Please login first.", 400);
        }

        const tokenobj = jwt.verify(token, process.env.JWT_SECRET ?? "");

        (req as any).user = await AdminUser.findById((tokenobj as any).id);

        if ((req as any).user === null)
            throw new MyError("Please login as an admin.", 400);

        next();
    }
);
