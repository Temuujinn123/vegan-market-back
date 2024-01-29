import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import Noitfication from "../models/Noitfication";
import MyError from "../utils/myError";
import Pagintate from "../utils/paginate";

export const getNotifications = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page || 1;

        ["page"].forEach((el) => delete req.query[el]);

        const filter: any = {
            created_at: { $gte: (req as any).user.created_at },
            $or: [{ user_id: (req as any).user._id }, { type: "all" }],
        };

        const pagination = await Pagintate(
            page as number,
            10,
            Noitfication,
            filter
        );

        const notifications = await Noitfication.find(filter)
            .sort({
                created_at: -1,
            })
            .skip(pagination.start - 1)
            .limit(10);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications,
            pagination,
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
