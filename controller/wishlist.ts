import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { IWishlist } from "../types/wishlist";
import Wishlist from "../models/Wishlist";

export const getWishlist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const productId: string | undefined = req.params.productId;

        let wishlist: IWishlist | IWishlist[] | null;

        if (productId || productId !== "") {
            wishlist = await Wishlist.findOne({
                user_id: _id,
                product_id: productId,
            });
        } else {
            wishlist = await Wishlist.find({ user_id: _id });
        }

        res.status(200).json({
            success: true,
            data: wishlist,
        });
    }
);

export const createWishlist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const { productId } = req.body;

        const wishlist: IWishlist = await Wishlist.create({
            user_id: _id,
            product_id: productId,
        });

        res.status(200).json({
            success: true,
            data: wishlist,
        });
    }
);

export const deleteWishlist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const { productId } = req.body;

        const result = await Wishlist.deleteOne({
            user_id: _id,
            productId: productId,
        });

        res.status(200).json({
            success: true,
        });
    }
);
