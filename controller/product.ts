import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "../models/Product";
import Pagintate from "../utils/paginate";

export const getProducts = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const select = req.query.select;
        const sort = req.query.sort;

        ["select", "sort", "page", "limit"].forEach(
            (el) => delete req.query[el]
        );

        const pagination = await Pagintate(
            page as number,
            limit as number,
            Product
        );

        const products = await Product.find(req.query, select)
            .populate({
                path: "category",
                select: "name averagePrice",
            })
            .sort(sort as string)
            .skip(pagination.start - 1)
            .limit(limit as number);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
            pagination,
        });
    }
);
