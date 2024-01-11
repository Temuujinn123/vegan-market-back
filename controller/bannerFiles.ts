import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import BannerFiles from "../models/BannerFiles";
import MyError from "../utils/myError";
import path from "path";
import { IBannerFile } from "../types/bannerFiles";

export const getBannerPhotos = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const files: IBannerFile[] = await BannerFiles.find();

        res.status(200).json({
            success: true,
            data: files,
        });
    }
);

export const deleteBannerPhoto = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.params.id);
        const file: IBannerFile | null = await BannerFiles.findById(
            req.params.id
        );

        if (!file) throw new MyError("Image not found...", 404);

        await BannerFiles.findByIdAndDelete(file._id);

        res.status(200).json({
            success: true,
            data: file,
        });
    }
);

export const uploadBannerPhoto = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const files = (req as any).files.file;

        if (!(files as any).mimetype?.startsWith("image"))
            throw new MyError("Please upload image file...", 400);

        if (
            process.env.MAX_UPLOAD_FILE_SIZE &&
            (files as any).size > process.env.MAX_UPLOAD_FILE_SIZE
        )
            throw new MyError("Your image's size is too big...", 400);

        (files as any).name = `photo_${req.params.id}${new Date().getTime()}${
            path.parse((files as any).name).ext
        }`;

        (files as any).mv(
            `${process.env.FILE_UPLOAD_PATH}/${(files as any).name}`,
            async (err: Error) => {
                if (err) throw new MyError(err.message, 400);

                await BannerFiles.create({
                    name: (files as any).name,
                });
            }
        );

        res.status(200).json({
            success: true,
        });
    }
);
