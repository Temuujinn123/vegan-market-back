import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { ICart, ICartItem } from "../types/cart";
import Cart from "../models/Cart";
import CartItem from "../models/CartItem";
import MyError from "../utils/myError";
import { populate } from "dotenv";
import path from "path";

export const getCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;

        const cart: ICart | null = await Cart.findOne({
            user_id: _id,
        })
            .populate({
                path: "cart_item",
                model: "CartItem",
                populate: {
                    path: "product",
                    model: "Product",
                    populate: [
                        {
                            path: "img",
                            model: "Files",
                        },
                        {
                            path: "category",
                            model: "Category",
                        },
                    ],
                },
            })
            .where("is_bought")
            .equals(false);

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
        })
            .where("is_bought")
            .equals(false);

        if (!cart) {
            throw new MyError("Cart not found", 400);
        }

        const cartItem: ICartItem | null = await CartItem.findOne({
            cart_id: cart?._id,
            product_id: productId,
        });

        if (change === "plus") {
            await cartItem?.updateOne({
                quantity: cartItem.quantity + 1,
            });
        } else {
            if (cartItem?.quantity === 1) {
                await cartItem.deleteOne();
            } else {
                await cartItem?.updateOne({
                    quantity: cartItem.quantity - 1,
                });
            }
        }

        res.status(200).json({
            success: true,
            data: cartItem,
        });
    }
);

export const createCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const { productId, quantity } = req.body;

        const cart: ICart | null = await Cart.findOne({
            user_id: _id,
        })
            .where("is_bought")
            .equals(false);

        const cartItem: ICartItem | null = await CartItem.findOne({
            cart_id: cart?._id,
            product_id: productId,
        });

        if (cartItem) {
            await cartItem.updateOne({
                quantity: cartItem.quantity + 1,
            });

            return res.status(200).json({
                success: true,
                data: cartItem,
            });
        }

        const newCartItem: ICartItem = await CartItem.create({
            cart_id: cart?._id,
            product_id: productId,
            quantity: +quantity,
        });

        res.status(200).json({
            success: true,
            data: newCartItem,
        });
    }
);

export const deleteCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const { productId } = req.body;

        const cart = await Cart.findOne({
            user_id: _id,
        })
            .where("is_bought")
            .equals(false);

        const result = await CartItem.deleteOne({
            cart_id: cart?._id,
            product_id: productId,
        });

        res.status(200).json({
            success: true,
        });
    }
);
