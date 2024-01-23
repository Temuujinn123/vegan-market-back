import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { IWishlist } from "../types/wishlist";
import Wishlist from "../models/Wishlist";
import Product from "../models/Product";
import { IProduct } from "../types/product";

export const getWishlist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;

        const wishlist: IWishlist[] | null = await Wishlist.find({
            user_id: _id,
        });

        if (wishlist && wishlist.length !== 0) {
            const productIds: (string | undefined)[] = wishlist.map(
                (wishlistItem) => wishlistItem.product_id
            );

            const products: IProduct[] = await Product.find({
                _id: { $in: productIds },
            }).limit(999999);

            res.status(200).json({
                success: true,
                data: products,
            });
        } else {
            res.status(200).json({
                success: true,
                data: null,
            });
        }
    }
);

export const checkProductInWishlist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const productId = req.query.productId;

        const wishlist: IWishlist | null = await Wishlist.findOne({
            user_id: _id,
            product_id: productId,
        });

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
            product_id: productId,
        });

        res.status(200).json({
            success: true,
        });
    }
);
