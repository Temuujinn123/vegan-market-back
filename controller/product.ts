import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Pagintate from "../utils/paginate";
import { IProduct } from "../types/product";
import Product from "../models/Product";
import MyError from "../utils/myError";
import path from "path";
import Category from "../models/Category";
import { ICategory } from "../types/category";

export const getCategoryProducts = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const select = req.query.select;
        const sort = req.query.sort;
        const search = req.query.search || "";
        const category = (req.query.category as string)?.split(",") || [];

        ["select", "sort", "page", "limit"].forEach(
            (el) => delete req.query[el]
        );

        const pagination = await Pagintate(
            page as number,
            limit as number,
            Product
        );

        const nameRegex = new RegExp(search as string, "i");

        let products;

        if (category.length !== 0) {
            products = await Product.find(
                {
                    name: { $regex: nameRegex },
                    category: { $in: category },
                },
                select
            )
                .populate({
                    path: "category",
                })
                .sort(sort as string)
                .skip(pagination.start - 1)
                .limit(limit as number)
                .where("is_deleted")
                .equals(false);
        } else {
            products = await Product.find(
                {
                    name: { $regex: nameRegex },
                },
                select
            )
                .populate({
                    path: "category",
                })
                .sort(sort as string)
                .skip(pagination.start - 1)
                .limit(limit as number)
                .where("is_deleted")
                .equals(false);
        }

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
            pagination,
        });
    }
);

export const lastProducts = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const products: IProduct[] | null = await Product.find()
            .sort({ created_at: -1 })
            .limit(3)
            .where("is_deleted")
            .equals(false);

        if (!products) throw new MyError("Product not found", 400);

        res.status(200).json({
            success: true,
            data: products,
        });
    }
);

export const createProduct = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const category: ICategory | null = await Category.findById(
            req.body.category
        );

        if (!category)
            throw new MyError(req.body.product + " is not found...", 400);

        const product: IProduct = await Product.create(req.body);

        res.status(200).json({
            success: true,
            data: product,
        });
    }
);

export const updateProduct = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const product: IProduct | null = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updated_at: Date.now() },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!product)
            throw new MyError(req.params.id + " is not found...", 404);

        res.status(200).json({
            success: true,
            data: product,
        });
    }
);

export const getProduct = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const product: IProduct | null = await Product.findById(
            req.params.id
        ).populate({
            path: "category",
        });

        if (!product)
            throw new MyError(req.params.id + " is not found...", 400);

        res.status(200).json({
            success: true,
            data: product,
        });
    }
);

export const deleteProduct = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const product: IProduct | null = await Product.findByIdAndUpdate(
            req.params.id,
            { is_deleted: true, updated_at: Date.now() }
        );

        if (!product)
            throw new MyError(req.params.id + " is not found...", 404);

        res.status(200).json({
            success: true,
            data: product,
        });
    }
);

export const uploadProductPhoto = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const product: IProduct | null = await Product.findById(req.params.id);

        if (!product)
            throw new MyError(req.params.id + " boook not found...", 404);

        // image upload

        const file = (req as any).files.file;

        console.log("file size =====>", file.size);

        if (!file.mimetype?.startsWith("image"))
            throw new MyError("Please upload image file...", 400);

        if (
            process.env.MAX_UPLOAD_FILE_SIZE &&
            file.size > process.env.MAX_UPLOAD_FILE_SIZE
        )
            throw new MyError("Your image's size is too big...", 400);

        file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

        file.mv(
            `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
            (err: Error) => {
                if (err) throw new MyError(err.message, 400);

                product.img = file.name;
                product.save();

                res.status(200).json({
                    success: true,
                    data: file.name,
                });
            }
        );
    }
);
