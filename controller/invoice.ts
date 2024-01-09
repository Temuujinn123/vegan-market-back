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

        const randomNumber = generateRandomNumber(15);
        const randomText = generateRandomText(15);

        const invoice: IInvoice = await Invoice.create({
            ...req.body,
            sender_invoice_no: randomNumber.toString(),
            invoice_receiver_code: randomText,
            cart_id: cart._id,
            user_id: _id,
        });

        const qpayToken: string | undefined = await GetQpayToken();
        console.log("🚀 ~ file: invoice.ts:47 ~ qpayToken:", qpayToken);

        if (!qpayToken)
            throw new MyError("Алдаа гарлаа та дахин оролдоно уу.", 401);

        const qpayShortUrl = await CreateQpayInvoice(
            qpayToken,
            randomNumber.toString(),
            randomText,
            invoice.amount
        );

        res.status(200).json({
            success: true,
            data: qpayShortUrl,
        });
    }
);

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

    console.log("🚀 ~ file: invoice.ts:12 ~ credentials:", credentials);
    const response = await axios(options);
    let token: string | undefined;
    if (response.data) {
        token = response.data.access_token;
    } else {
        token = undefined;
    }
    return token;
};

const CreateQpayInvoice = async (
    token: string,
    senderNumber: string,
    receiverCode: string,
    amount: number
): Promise<string | undefined> => {
    const qpayBaseUrl = process.env.PROD_QPAY_API_BASE_URL;
    const apiBaseUrl = process.env.PROD_API_BASE_URL;

    console.log("------------> ", process.env.PROD_QPAY_API_BASE_URL);

    const response = await axios({
        method: "POST",
        url: `${qpayBaseUrl}/invoice`,
        data: {
            invoice_code: "VEGAN_MARKET_INVOICE",
            sender_invoice_no: senderNumber,
            invoice_receiver_code: receiverCode,
            invoice_description: "Description",
            amount: amount,
            callback_url: `${apiBaseUrl}/payments?payment_id=${senderNumber}`,
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
