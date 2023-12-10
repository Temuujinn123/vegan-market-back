import MyError from "../utils/myError";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler";

export const protect = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.authorization) {
            throw new MyError("Please login first.", 401);
        }

        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            throw new MyError("Please login first.", 400);
        }

        const tokenobj = jwt.verify(token, process.env.JWT_SECRET ?? "");

        // req.user = User.findById(tokenobj.id);

        next();
    }
);
