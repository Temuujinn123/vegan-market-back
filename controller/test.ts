import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import Test from "../models/Test";

export const createTest = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { username, password } = req.body;

        await Test.create({ username, password });

        res.status(200).json({
            success: true,
        });
    }
);
