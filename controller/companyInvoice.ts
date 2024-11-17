import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import MyError from "../utils/myError";
import Pagintate from "../utils/paginate";
import CompanyInvoice from "../models/CompanyInvoice";
import { ICompanyInvoice } from "../types/companyInvoice";
import CompanyNotification from "../models/CompanyNotification";
import { ICompanyCart, ICompanyCartItem } from "../types/companyCart";
import CompanyCart from "../models/CompanyCart";
import { generateRandomNumber } from "../utils/generateRandom";
import { CourierClient } from "@trycourier/courier";
import CompanyUser from "../models/CompanyUser";

import { Workbook } from "exceljs";
import moment from "moment";
import path from "path";

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

export const createInvoioceExcel = asyncHandler(
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
                    },
                },
            })
            .populate({
                path: "user",
            });

        if (!invoice) throw new MyError("Invoice not found", 404);

        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet("My sheet");

        // Add header rows
        const row1 = worksheet.addRow([
            "",
            "НХМаягт БМ-3х",
            "Сангийн сайдын 2017 оны 12 сарын 05 өдрийн 347 тоот тушаал хавсралт",
            "",
            "",
        ]);

        row1.getCell(2).font = { size: 11 };
        row1.getCell(3).font = { size: 8 };
        worksheet.mergeCells("C1:F1");

        const row2 = worksheet.addRow([
            "",
            "",
            "",
            `Огноо: ${moment().format("YYYY-MM-DD")}`,
        ]);

        row2.getCell(4).font = { size: 10 };

        worksheet.mergeCells("D2:F2");

        const row3 = worksheet.addRow([
            "",
            "",
            `ЗАРЛАГЫН БАРИМТ №${invoice.invoice_no}`,
        ]);

        row3.getCell(3).font = { size: 11 };

        const row4 = worksheet.addRow([
            "",
            "Орчис Трейд ХХК",
            "",
            "Худалдан авагч тал",
            "",
            "",
        ]);

        row4.getCell(2).font = { size: 10 };
        row4.getCell(4).font = { size: 10 };

        worksheet.mergeCells("B4:C4");
        worksheet.mergeCells("D4:F4");

        const row5 = worksheet.addRow([
            "",
            "Утас: 91908788",
            "",
            `Нэр: ${(invoice as any).user?.company_name}`,
            "",
            "",
        ]);

        row5.getCell(2).font = { size: 10 };
        row5.getCell(4).font = { size: 10 };

        worksheet.mergeCells("B5:C5");
        worksheet.mergeCells("D5:F5");

        const row6 = worksheet.addRow([
            "",
            "ТТД: 6415458",
            "",
            `Код: ${(invoice as any).user?.company_code}`,
            "",
            "",
        ]);

        row6.getCell(2).font = { size: 10 };
        row6.getCell(4).font = { size: 10 };

        worksheet.mergeCells("B6:C6");
        worksheet.mergeCells("D6:F6");

        const row7 = worksheet.addRow([
            "",
            "",
            "",
            `Хаяг: ${(invoice as any).user?.address}`,
            "",
            "",
        ]);

        row7.getCell(2).font = { size: 10 };
        row7.getCell(4).font = { size: 10 };

        worksheet.mergeCells("B7:C7");
        worksheet.mergeCells("D7:F7");

        worksheet.addRow([]); // Empty row for spacing row 8

        // Add table header
        const row9 = worksheet.addRow([
            "№",
            "Бар код",
            "Барааны нэрс",
            "Нийт тоо",
            "Нэгж үнэ",
            "Нийт үнэ",
        ]);

        row9.font = { size: 11 };
        row9.getCell(1).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row9.getCell(2).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row9.getCell(3).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row9.getCell(4).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row9.getCell(5).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row9.getCell(6).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };

        // Add cart items
        (invoice as any).cart?.cart_item.forEach(
            (cartItem: ICompanyCartItem, index: number) => {
                const rows = worksheet.addRow([
                    index + 1,
                    cartItem.product?.bar_code,
                    cartItem.product?.name,
                    cartItem.quantity,
                    cartItem.product?.price,
                    cartItem.quantity * (cartItem.product as any).price,
                ]);

                rows.font = { size: 11 };

                rows.getCell(1).border = {
                    bottom: { style: "thin" },
                    top: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
                rows.getCell(2).border = {
                    bottom: { style: "thin" },
                    top: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
                rows.getCell(3).border = {
                    bottom: { style: "thin" },
                    top: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
                rows.getCell(4).border = {
                    bottom: { style: "thin" },
                    top: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
                rows.getCell(5).border = {
                    bottom: { style: "thin" },
                    top: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
                rows.getCell(6).border = {
                    bottom: { style: "thin" },
                    top: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
            }
        );

        // Add total row
        const row10 = worksheet.addRow([
            "",
            "Нийт дүн",
            "",
            (invoice as any).cart?.total_quantity,
            "",
            (invoice as any).cart?.total_price,
        ]);

        row10.font = { size: 11 };
        row10.getCell(1).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row10.getCell(2).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row10.getCell(3).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row10.getCell(4).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row10.getCell(5).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
        row10.getCell(6).border = {
            bottom: { style: "thin" },
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.addRow([]); // Empty row for spacing
        worksheet.addRow([]); // Empty row for spacing

        // Add bank details
        const row11 = worksheet.addRow([
            "",
            "Голомт банк: 2105130447 Орчис Трейд ХХК",
            "",
            "",
            "",
        ]);

        row11.getCell(2).font = { size: 10 };

        worksheet.mergeCells(
            `B${13 + ((invoice as any).cart?.cart_item?.length ?? 1)}:C${
                13 + ((invoice as any).cart?.cart_item?.length ?? 1)
            }`
        );

        const row12 = worksheet.addRow([
            "",
            "Хаан банк: 5003562993 Б.Батсүх",
            "",
            "",
            "",
        ]);

        row12.getCell(2).font = { size: 10 };

        worksheet.mergeCells(
            `B${14 + ((invoice as any).cart?.cart_item?.length ?? 1)}:C${
                14 + ((invoice as any).cart?.cart_item?.length ?? 1)
            }`
        );

        const row13 = worksheet.addRow([
            "",
            "",
            "",
            `Төлөх нийт дүн: ${(invoice as any).cart?.total_price}`,
            "",
            "",
        ]);

        row13.getCell(4).font = { size: 10 };

        worksheet.mergeCells(
            `D${15 + ((invoice as any).cart?.cart_item?.length ?? 1)}:F${
                15 + ((invoice as any).cart?.cart_item?.length ?? 1)
            }`
        );

        worksheet.addRow([]); // Empty row for spacing row 16

        const row16 = worksheet.addRow([
            "",
            "Тэмдэг",
            "",
            "Хүлээн авсан:..............................................................................",
            "",
            "",
            "",
        ]);

        row16.font = { size: 10 };

        worksheet.mergeCells(
            `B${17 + ((invoice as any).cart?.cart_item?.length ?? 1)}:C${
                17 + ((invoice as any).cart?.cart_item?.length ?? 1)
            }`
        );
        worksheet.mergeCells(
            `D${17 + ((invoice as any).cart?.cart_item?.length ?? 1)}:F${
                17 + ((invoice as any).cart?.cart_item?.length ?? 1)
            }`
        );

        const row17 = worksheet.addRow([
            "",
            "",
            "",
            "Хүлээлгэн өгсөн:.........................................................................",
            "",
            "",
            "",
        ]);

        row17.font = { size: 10 };

        worksheet.mergeCells(
            `D${18 + ((invoice as any).cart?.cart_item?.length ?? 1)}:F${
                18 + ((invoice as any).cart?.cart_item?.length ?? 1)
            }`
        );

        // Adjust column widths
        worksheet.columns.forEach((column, index) => {
            if (index === 2) {
                column.width = 30;
            } else if (index === 0) {
                column.width = 5; // Adjust width as needed
            } else if (index === 3) {
                column.width = 20;
            } else if (index === 1) {
                column.width = 25;
            } else {
                column.width = 15;
            }
        });

        // Save the Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Set response headers to indicate we're returning an Excel file
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="invoice_${invoice.invoice_no}.xlsx"`
        );

        await workbook.xlsx
            .write(res)
            .then((buffer) => {
                res.send(buffer);
            })
            .catch((err) => {
                res.status(500).send("Error generating file");
            });
    }
);
