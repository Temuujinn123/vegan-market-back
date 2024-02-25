import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import MyError from "../utils/myError";
import { ICompanyCart, ICompanyCartItem } from "../types/companyCart";
import CompanyCart from "../models/CompanyCart";
import CompanyCartItem from "../models/CompanyCartItem";

export const getCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;

        const cart: ICompanyCart | null = await CompanyCart.findOne({
            user_id: _id,
        })
            .populate({
                path: "cart_item",
                model: "CompanyCartItem",
                populate: {
                    path: "product",
                    model: "CompanyProduct",
                    populate: {
                        path: "img",
                        model: "Files",
                    },
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

        const cart: ICompanyCart | null = await CompanyCart.findOne({
            user_id: _id,
        })
            .where("is_bought")
            .equals(false);

        if (!cart) {
            throw new MyError("Cart not found", 400);
        }

        const cartItem: ICompanyCartItem | null = await CompanyCartItem.findOne(
            {
                cart_id: cart?._id,
                product_id: productId,
            }
        );

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
        const { productId } = req.body;

        const cart: ICompanyCart | null = await CompanyCart.findOne({
            user_id: _id,
        })
            .where("is_bought")
            .equals(false);

        const cartItem: ICompanyCartItem | null = await CompanyCartItem.findOne(
            {
                cart_id: cart?._id,
                product_id: productId,
            }
        );

        if (cartItem) {
            await cartItem.updateOne({
                quantity: cartItem.quantity + 1,
            });

            return res.status(200).json({
                success: true,
                data: cartItem,
            });
        }

        const newCartItem: ICompanyCartItem = await CompanyCartItem.create({
            cart_id: cart?._id,
            product_id: productId,
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

        const cart = await CompanyCart.findOne({
            user_id: _id,
        })
            .where("is_bought")
            .equals(false);

        const result = await CompanyCartItem.deleteOne({
            cart_id: cart?._id,
            product_id: productId,
        });

        res.status(200).json({
            success: true,
        });
    }
);
