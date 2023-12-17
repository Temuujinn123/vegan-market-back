import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { ICart } from "../types/cart";
import Cart from "../models/Cart";

export const getCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;

        const cart: ICart[] | null = await Cart.find({
            user_id: _id,
        }).populate({
            path: "product",
        });

        res.status(200).json({
            success: true,
            data: cart,
        });
    }
);

export const changeQuantityOfCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const productId = req.query.productId;
        const change = req.query.change;

        const cart: ICart | null = await Cart.findOne({
            user_id: _id,
            product_id: productId,
        });

        if (change === "plus") {
            await cart?.updateOne({
                quantity: cart.quantity + 1,
            });
        } else {
            if (cart?.quantity === 1) {
                await cart.deleteOne();
            } else {
                await cart?.updateOne({
                    quantity: cart.quantity - 1,
                });
            }
        }

        res.status(200).json({
            success: true,
            data: cart,
        });
    }
);

export const createCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const { productId } = req.body;

        const cart: ICart | null = await Cart.findOne({
            user_id: _id,
            product_id: productId,
        });

        if (cart) {
            await cart.updateOne({
                quantity: cart.quantity + 1,
            });

            return res.status(200).json({
                success: true,
                data: cart,
            });
        }

        const newCart: ICart = await Cart.create({
            user_id: _id,
            product_id: productId,
        });

        res.status(200).json({
            success: true,
            data: newCart,
        });
    }
);

export const deleteCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const { productId } = req.body;

        const result = await Cart.deleteOne({
            user_id: _id,
            product_id: productId,
        });

        res.status(200).json({
            success: true,
        });
    }
);
