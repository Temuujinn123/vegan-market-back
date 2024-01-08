import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import Invoice from "../models/Invoice";
import Cart from "../models/Cart";
import { ICart } from "../types/cart";
import MyError from "../utils/myError";
import { IInvoice } from "../types/invoice";

export const getInvoices = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // res.status(200).json({
        //     success: true,
        //     data: invoices,
        // });
    }
);

export const createInvoice = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;

        const cart: ICart | null = await Cart.findOne({
            user_id: _id,
        })
            .where("is_bought")
            .equals(false);

        if (!cart) throw new MyError("Cart not found", 404);

        const invoice: IInvoice = await Invoice.create({
            ...req.body,
            cart_id: cart._id,
            user_id: _id,
        });

        res.status(200).json({
            success: true,
            data: invoice,
        });
    }
);
