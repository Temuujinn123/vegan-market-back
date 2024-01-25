import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import Noitfication from "../models/Noitfication";
import MyError from "../utils/myError";

export const getNotifications = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const notifications = await Noitfication.find({
            user_id: (req as any).user._id,
        });

        res.status(200).json({
            success: true,
            data: notifications,
        });
    }
);

export const changeNotificationStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const notification = await Noitfication.findByIdAndUpdate(
            req.params.id,
            { is_read: true }
        );

        if (!notification) {
            throw new MyError("Notification not found", 404);
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    }
);
