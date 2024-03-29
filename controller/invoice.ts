import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import Invoice from "../models/Invoice";
import Cart from "../models/Cart";
import { ICart } from "../types/cart";
import MyError from "../utils/myError";
import { IInvoice } from "../types/invoice";
import {
    generateRandomNumber,
    generateRandomText,
} from "../utils/generateRandom";
import axios from "axios";
import Pagintate from "../utils/paginate";
import Noitfication from "../models/Noitfication";

export const getInvoices = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const search = req.query.search || "";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;
        const isPaid: boolean | undefined = req.query.isPaid
            ? Boolean(req.query.isPaid)
            : undefined;
        const isDelivered: boolean | undefined = req.query.isDelivered
            ? Boolean(req.query.isDelivered)
            : undefined;
        const isPending: boolean | undefined = req.query.isPending
            ? Boolean(req.query.isPending)
            : undefined;

        ["page", "limit", "search", "startDate", "endDate"].forEach(
            (el) => delete req.query[el]
        );

        const { _id } = (req as any).user;

        const filter: any = {};

        if (isPaid) filter.is_paid = isPaid;
        if (isDelivered) filter.is_delivered = isDelivered;
        if (isPending) filter.is_paid = false;

        const pagination = await Pagintate(
            page as number,
            limit as number,
            Invoice,
            filter
        );

        if (startDate && endDate) {
            filter.created_at = {
                $gte: startDate,
                $lte: endDate,
            };
        } else if (startDate) {
            filter.created_at = { $gte: startDate };
        } else if (endDate) {
            filter.created_at = { $lte: endDate };
        }

        if (search) {
            const searchRegex = new RegExp(search as string, "i");
            filter.sender_invoice_no = { $regex: searchRegex };
        }

        if (_id) {
            filter.user_id = _id;
        }

        const invoices: IInvoice[] = await Invoice.find(filter)
            .populate({
                path: "cart_id",
                model: "Cart",
                populate: {
                    path: "user_id",
                    model: "User",
                },
            })
            .skip(pagination.start - 1)
            .limit(limit as number)
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices,
            pagination,
        });
    }
);

export const getInvoice = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const invoice: IInvoice | null = await Invoice.findById(req.params.id)
            .populate({
                path: "cart",
                model: "Cart",
                populate: {
                    path: "cart_item",
                    model: "CartItem",
                    populate: {
                        path: "product",
                        model: "Product",
                    },
                },
            })
            .populate({
                path: "user",
            });

        res.status(200).json({
            success: true,
            data: invoice,
        });
    }
);

export const updateInvoice = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { is_delivered, is_paid } = req.body;

        if (is_delivered && is_paid) {
            throw new MyError(
                "You can not update is_delivered and is_paid at the same time",
                400
            );
        }

        if (is_paid === undefined && is_delivered === undefined) {
            throw new MyError("You must update is_paid or is_delivered", 400);
        }

        let filter: any;

        if (is_paid !== undefined) {
            filter = {
                is_paid: is_paid,
            };
        } else if (is_delivered !== undefined) {
            filter = {
                is_delivered: is_delivered,
            };
        }

        const invoice: IInvoice | null = await Invoice.findByIdAndUpdate(
            req.params.id,
            filter
        );

        if (is_paid) {
            await Noitfication.create({
                user_id: invoice?.user_id,
                url: "/profile/history",
                content: "Таны захиалга амжилттай баталгаажлаа.",
                type: "personal",
            });
        }

        res.status(200).json({
            success: true,
            data: invoice,
        });
    }
);

export const confirmInvoicePayment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { invoice_id } = req.params;

        const invoice: IInvoice | null = await Invoice.findByIdAndUpdate(
            invoice_id,
            {
                is_paid: true,
            }
        );

        if (!invoice) throw new MyError("Invoice not found", 404);

        const cart: ICart | null = await Cart.findByIdAndUpdate(
            invoice.cart_id,
            {
                is_bought: true,
            }
        );

        if (!cart) throw new MyError("Cart not found", 404);

        const user_id = cart.user_id;

        await Cart.create({
            user_id,
        });

        await Noitfication.create({
            user_id: user_id,
            url: "/profile/history",
            content: "Таны захиалга амжилттай баталгаажлаа.",
        });

        res.status(200).json({
            success: true,
        });
    }
);

export const createInvoice = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;

        const method = req.query.method;

        const cart: ICart | null = await Cart.findOne({
            user_id: _id,
        })
            .where("is_bought")
            .equals(false);

        if (!cart) throw new MyError("Cart not found", 404);

        const randomNumber = generateRandomNumber(15);
        const randomText = generateRandomText(15);

        const invoice: IInvoice = await Invoice.create({
            ...req.body,
            sender_invoice_no: randomNumber.toString(),
            invoice_receiver_code: randomText,
            cart_id: cart._id,
            user_id: _id,
            method: method,
        });

        if (method === "qpay") {
            const qpayToken: string | undefined = await GetQpayToken();

            if (!qpayToken)
                throw new MyError("Алдаа гарлаа та дахин оролдоно уу.", 401);

            const qpayShortUrl = await CreateQpayInvoice(
                qpayToken,
                randomNumber.toString(),
                randomText,
                invoice.amount,
                invoice._id
            );

            res.status(200).json({
                success: true,
                data: qpayShortUrl,
            });
        } else {
            const cart: ICart | null = await Cart.findByIdAndUpdate(
                invoice.cart_id,
                {
                    is_bought: true,
                }
            );

            if (!cart) throw new MyError("Cart not found", 404);

            const user_id = cart.user_id;

            await Cart.create({
                user_id,
            });

            res.status(200).json({
                success: true,
                data: invoice,
            });
        }
    }
);

// Get QPay token function
const GetQpayToken = async (): Promise<string | undefined> => {
    const qpayUsername = process.env.PROD_QPAY_USERNAME;
    const qpayPassword = process.env.PROD_QPAY_PASS;
    const qpayBaseUrl = process.env.PROD_QPAY_API_BASE_URL;

    const credentials = `${qpayUsername}:${qpayPassword}`;

    const base64Credentials = btoa(credentials);

    var options = {
        method: "POST",
        url: `${qpayBaseUrl}/auth/token`,
        headers: {
            Authorization: `Basic ${base64Credentials}`,
        },
    };

    const response = await axios(options);
    let token: string | undefined;
    if (response.data) {
        token = response.data.access_token;
    } else {
        token = undefined;
    }
    return token;
};

// Create QPay invocie function
const CreateQpayInvoice = async (
    token: string,
    senderNumber: string,
    receiverCode: string,
    amount: number,
    invocieId: string
): Promise<string | undefined> => {
    const qpayBaseUrl = process.env.PROD_QPAY_API_BASE_URL;
    const apiBaseUrl = process.env.PROD_API_BASE_URL;
    const invoiceCode = process.env.PROD_QPAY_INVOICE;

    const response = await axios({
        method: "POST",
        url: `${qpayBaseUrl}/invoice`,
        data: {
            invoice_code: invoiceCode,
            sender_invoice_no: senderNumber,
            invoice_receiver_code: receiverCode,
            invoice_description: "Description",
            amount: amount,
            callback_url: `${apiBaseUrl}/invoice/payment?invoice_id=${invocieId}`,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.data) {
        return response.data.qPay_shortUrl;
    } else {
        return undefined;
    }
};
