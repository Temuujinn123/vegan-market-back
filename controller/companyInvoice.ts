import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import MyError from "../utils/myError";
import Pagintate from "../utils/paginate";
import CompanyInvoice from "../models/CompanyInvoice";
import { ICompanyInvoice } from "../types/companyInvoice";
import CompanyNotification from "../models/CompanyNotification";
import { ICompanyCart } from "../types/companyCart";
import CompanyCart from "../models/CompanyCart";
import { generateRandomNumber } from "../utils/generateRandom";
import { CourierClient } from "@trycourier/courier";
import CompanyUser from "../models/CompanyUser";

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
        const isCancelled: boolean | undefined = req.query.isCancelled
            ? Boolean(req.query.isCancelled)
            : undefined;

        ["page", "limit", "search", "startDate", "endDate"].forEach(
            (el) => delete req.query[el]
        );

        const filter: any = {};

        if (isPaid) filter.is_paid = isPaid;
        if (isDelivered) filter.is_delivered = isDelivered;
        if (isPending) {
            filter.is_cancelled = false;
            filter.is_delivered = false;
        }
        if (isCancelled) filter.is_cancelled = isCancelled;

        const pagination = await Pagintate(
            page as number,
            limit as number,
            CompanyInvoice,
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

        // if (search) {
        //     const searchRegex = new RegExp(search as string, "i");
        //     filter.sender_invoice_no = { $regex: searchRegex };
        // }

        if ((req as any).user) {
            filter.user_id = (req as any).user._id;
        }

        const invoices: ICompanyInvoice[] = await CompanyInvoice.find(filter)
            .populate({
                path: "cart",
                model: "CompanyCart",
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
        const invoice: ICompanyInvoice | null = await CompanyInvoice.findById(
            req.params.id
        )
            .populate({
                path: "cart",
                model: "CompanyCart",
                populate: {
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

const courier = new CourierClient({
    authorizationToken: "pk_prod_YKW6H56ARBMFXZK4BJ2VQ3K2R7NA",
});

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

        const invoice: ICompanyInvoice | null =
            await CompanyInvoice.findByIdAndUpdate(req.params.id, filter);

        if (is_paid) {
            await CompanyNotification.create({
                user_id: invoice?.user_id,
                url: "/profile/history",
                content: "Таны захиалга амжилттай баталгаажлаа.",
                type: "personal",
            });

            const user = await CompanyUser.findById(invoice?.user_id);

            const { requestId } = await courier.send({
                message: {
                    to: {
                        email: user?.email,
                    },
                    template: "A0N71XS8QAMJ85P4GGS16N5CV8A5",
                    data: {
                        recipientName: user?.company_name,
                    },
                },
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

        const invoice: ICompanyInvoice | null =
            await CompanyInvoice.findByIdAndUpdate(invoice_id, {
                is_paid: true,
            });

        if (!invoice) throw new MyError("Invoice not found", 404);

        const cart: ICompanyCart | null = await CompanyCart.findByIdAndUpdate(
            invoice.cart_id,
            {
                is_bought: true,
            }
        );

        if (!cart) throw new MyError("Cart not found", 404);

        const user_id = cart.user_id;

        await CompanyCart.create({
            user_id,
        });

        await CompanyNotification.create({
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

        const cart: ICompanyCart | null = await CompanyCart.findOne({
            user_id: _id,
        })
            .where("is_bought")
            .equals(false);

        if (!cart) throw new MyError("Cart not found", 404);

        const randomNumber = generateRandomNumber(6);

        const countOfInvoice = await CompanyInvoice.countDocuments();

        const invoice: ICompanyInvoice = await CompanyInvoice.create({
            ...req.body,
            sender_invoice_no: randomNumber.toString(),
            cart_id: cart._id,
            user_id: _id,
            invoice_no: countOfInvoice ?? 1,
        });

        await CompanyCart.findByIdAndUpdate(invoice.cart_id, {
            is_bought: true,
        });

        if (!cart) throw new MyError("Cart not found", 404);

        const user_id = cart.user_id;

        await CompanyCart.create({
            user_id,
        });

        res.status(200).json({
            success: true,
            data: invoice,
        });
    }
);
