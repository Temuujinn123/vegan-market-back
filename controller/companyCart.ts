import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import MyError from "../utils/myError";
import { ICompanyCart, ICompanyCartItem } from "../types/companyCart";
import CompanyCart from "../models/CompanyCart";
import CompanyCartItem from "../models/CompanyCartItem";
import CompanyProduct from "../models/CompanyProduct";

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
                    populate: [
                        {
                            path: "img",
                            model: "Files",
                        },
                        {
                            path: "category",
                            model: "CompanyCategory",
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
        const changeTo = req.query.changeTo;

        const cart: ICompanyCart | null = await CompanyCart.findByIdAndUpdate({
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
        ).populate("product");

        await cartItem?.updateOne({
            quantity: parseInt(changeTo as string),
        });

        if (!cartItem?.product) {
            throw new MyError("Product not found", 400);
        }

        let totalPrice =
            cart.total_price +
            cartItem?.product?.price * (cartItem?.quantity ?? 1) -
            parseInt(changeTo as string);

        if (
            cartItem.product?.is_sale &&
            cartItem.product?.sale_start_date &&
            cartItem.product?.sale_end_date &&
            new Date(cartItem.product?.sale_start_date) <= new Date() &&
            new Date(cartItem.product?.sale_end_date) >= new Date()
        ) {
            totalPrice =
                cart.total_price +
                cartItem?.product?.sale_price *
                    ((cartItem?.quantity ?? 1) - parseInt(changeTo as string));
        }

        await CompanyCart.findByIdAndUpdate(_id, {
            total_quantity: cart.total_quantity + parseInt(changeTo as string),
            total_price: totalPrice,
        })
            .where("is_bought")
            .equals(false);

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

        const product = await CompanyProduct.findById(productId);

        if (!product) {
            throw new MyError("Product not found", 400);
        }

        let cart: ICompanyCart | null = await CompanyCart.findOne({
            user_id: _id,
        })
            .where("is_bought")
            .equals(false);

        if (!cart) {
            cart = await CompanyCart.create({
                user_id: _id,
                total_quantity: 1,
                total_price: product.is_sale
                    ? product.sale_start_date &&
                      product.sale_end_date &&
                      new Date(product.sale_start_date) >= new Date() &&
                      new Date(product.sale_end_date) <= new Date()
                        ? product.sale_price
                        : product.price
                    : product.price,
            });
        } else {
            await CompanyCart.findByIdAndUpdate(cart._id, {
                total_quantity: cart.total_quantity + 1,
                total_price:
                    cart.total_price +
                    (product.is_sale
                        ? product.sale_start_date &&
                          product.sale_end_date &&
                          new Date(product.sale_start_date) >= new Date() &&
                          new Date(product.sale_end_date) <= new Date()
                            ? product.sale_price
                            : product.price
                        : product.price),
            });
        }

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
