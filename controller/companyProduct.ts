import { NextFunction, Request, Response } from "express";
import Pagintate from "../utils/paginate";
import MyError from "../utils/myError";
import path from "path";
import asyncHandler from "../middleware/asyncHandler";
import Files from "../models/Files";
import uploadImageToCloudinary from "../utils/uploadCloudinary";
import CompanyProduct from "../models/CompanyProduct";
import { ICompanyProduct } from "../types/companyProduct";
import { ICompanyCategory } from "../types/companyCategory";
import CompanyCategory from "../models/CompanyCategory";
import CompanyNotification from "../models/CompanyNotification";

export const getCategoryProducts = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const select = req.query.select;
        const sort = req.query.sort;
        const search = req.query.search || "";
        const category = req.query.category
            ? (req.query.category as string)?.split(",")
            : [];
        const is_sale = req.query.is_sale ?? undefined;

        ["select", "sort", "page", "limit", "is_sale"].forEach(
            (el) => delete req.query[el]
        );

        const filter: any = {
            is_deleted: false,
        };

        if (category.length !== 0) {
            filter.category = {
                $in: category,
            };
        }

        if (is_sale) {
            (filter.is_sale = Boolean(is_sale)),
                (filter.sale_start_date = {
                    $lte: new Date(),
                });
            filter.sale_end_date = {
                $gte: new Date(),
            };
        }

        const nameRegex = new RegExp(search as string, "i");

        if (nameRegex) {
            filter.name = {
                $regex: nameRegex,
            };
        }

        const pagination = await Pagintate(
            page as number,
            limit as number,
            CompanyProduct,
            filter
        );

        const products = await CompanyProduct.find(
            {
                ...filter,
            },
            select
        )
            .populate(["category", "img"])
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

export const lastProducts = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const products: ICompanyProduct[] | null = await CompanyProduct.find()
            .populate(["category", "img"])
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

export const createProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const category: ICompanyCategory | null =
            await CompanyCategory.findById(req.body.category);

        if (!category)
            throw new MyError(req.body.product + " is not found...", 400);

        const product: ICompanyProduct = await CompanyProduct.create({
            ...req.body,
            category: category?._id,
        });

        await CompanyNotification.create({
            content: `${product.name} нэмэгдлээ.`,
            url: `/products/${product._id}`,
            type: "all",
        });

        if (product.is_sale) {
            const now = new Date();
            const startDate = product.sale_start_date
                ? new Date(product.sale_start_date)
                : undefined;
            const endDate = product.sale_end_date
                ? new Date(product.sale_end_date)
                : undefined;

            if (startDate && endDate) {
                if (now > startDate && now < endDate) {
                    await CompanyNotification.create({
                        content: `${product.name} хямдарлаа.`,
                        url: `/products/${product._id}`,
                        type: "all",
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    }
);

export const updateProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const category: ICompanyCategory | null =
            await CompanyCategory.findById(req.body.category);

        if (!category)
            throw new MyError(req.body.category + " is not found...", 400);

        let product: ICompanyProduct | null =
            await CompanyProduct.findByIdAndUpdate(req.params.id, {
                ...req.body,
                category: category?._id,
            });

        if (!product)
            throw new MyError(req.params.id + " is not found...", 404);

        if (product.is_sale) {
            const now = new Date();
            const startDate = product.sale_start_date
                ? new Date(product.sale_start_date)
                : undefined;
            const endDate = product.sale_end_date
                ? new Date(product.sale_end_date)
                : undefined;

            if (startDate && endDate) {
                if (now > startDate && now < endDate) {
                    await CompanyNotification.create({
                        content: `${product.name} хямдарлаа`,
                        url: `/products/${product._id}`,
                        type: "all",
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    }
);

export const getProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const product: ICompanyProduct | null = await CompanyProduct.findById(
            req.params.id
        ).populate(["category", "img"]);

        if (!product)
            throw new MyError(req.params.id + " is not found...", 400);

        res.status(200).json({
            success: true,
            data: product,
        });
    }
);

export const deleteProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const product: ICompanyProduct | null =
            await CompanyProduct.findByIdAndUpdate(req.params.id, {
                is_deleted: true,
                updated_at: Date.now(),
            });

        if (!product)
            throw new MyError(req.params.id + " is not found...", 404);

        res.status(200).json({
            success: true,
            data: product,
        });
    }
);

export const deletePhoto = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        await Files.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
        });
    }
);

export const uploadProductPhoto = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const product: ICompanyProduct | null = await CompanyProduct.findById(
            req.params.id
        );

        if (!product)
            throw new MyError(req.params.id + " boook not found...", 404);

        const files = req.files?.file;

        if (!files) throw new MyError("Please upload file...", 400);

        if (Array.isArray(files)) {
            for (const file of files) {
                if (!file.mimetype?.startsWith("image"))
                    throw new MyError("Please upload image file...", 400);
                if (
                    process.env.MAX_UPLOAD_FILE_SIZE &&
                    file.size > +process.env.MAX_UPLOAD_FILE_SIZE
                )
                    throw new MyError("Your image's size is too big...", 400);
                file.name = `photo_${req.params.id}${new Date().getTime()}${
                    path.parse(file.name).ext
                }`;
                file.mv(
                    `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
                    async (err: Error) => {
                        if (err) throw new MyError(err.message, 400);

                        const result = await uploadImageToCloudinary(file.name);

                        await Files.create({
                            name: file.name,
                            url: result,
                            product_id: product._id,
                        });
                    }
                );
            }

            return res.status(200).json({
                success: true,
            });
        }

        if (!files.mimetype?.startsWith("image"))
            throw new MyError("Please upload image file...", 400);

        files.name = `photo_${req.params.id}${new Date().getTime()}${
            path.parse(files.name).ext
        }`;

        files.mv(`./public/upload/${files.name}`, async (err: Error) => {
            console.log("=========> ", err);
            if (err) throw new MyError(err.message, 400);

            const result = await uploadImageToCloudinary(files.name);

            await Files.create({
                name: files.name,
                url: result,
                product_id: product._id,
            });
            res.status(200).json({
                success: true,
            });
        });
    }
);
