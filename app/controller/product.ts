import { NextFunction, Request, Response } from "express";
import Pagintate from "../utils/paginate";
import { IProduct } from "../types/product";
import Product from "../models/Product";
import MyError from "../utils/myError";
import path from "path";
import Category from "../models/Category";
import { ICategory } from "../types/category";
import asyncHandler from "../middleware/asyncHandler";
import Files from "../models/Files";
import multer from "multer";

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
            Product,
            filter
        );

        const products = await Product.find(
            {
                ...filter,
            },
            select
        )
            .populate(["category", "img"])
            .sort(sort as string)
            .skip(pagination.start - 1)
            .limit(limit as number)
            .where("is_deleted")
            .equals(false);

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
        const products: IProduct[] | null = await Product.find()
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

export const updateProduct = asyncHandler(
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

export const getProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const product: IProduct | null = await Product.findById(
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

export const deletePhoto = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        await Files.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
        });
    }
);

const storage = multer.diskStorage({
    destination: "../public/upload/",
    filename: (req, file, cb) => {
        console.log("============>", file);
        file.filename = `photo-${Date.now()}-${file.originalname}`;
        cb(null, file.filename);
    },
});

const upload = multer({ storage: storage });

export const uploadImage = upload.single("file");

export const uploadProductPhoto = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { filename }: any = req.file;

        console.log("==========> filename: ", filename);

        // Save the file path to MongoDB
        const imagePath = path.join("public/upload", filename);
        const file = await Files.create({
            name: filename,
            product_id: req.params.id,
        });

        res.status(200).json({
            success: true,
        });
        // const file = req?.files?.file;
        // // const product: IProduct | null = await Product.findById(req.params.id);

        // if (file === undefined) throw new MyError("File is required", 400);

        // if (Array.isArray(file))
        //     throw new MyError("Only one file is required", 400);

        // const newFile = await Files.create({
        //     name: file.name,
        //     data: file.data,
        //     product_id: req.params.id,
        // });

        // res.status(200).json({
        //     success: true,
        //     data: newFile,
        // });

        // const uploadedFile = req.file;
        // console.log("🚀 ~ uploadedFile:", uploadedFile);
        // const product: IProduct | null = await Product.findById(req.params.id);
        // // Check if a file was uploaded
        // if (!uploadedFile) {
        //     return res.status(400).json({ error: "No file uploaded." });
        // }
        // // Display the file details
        // const filePath = path.join(
        //     __dirname,
        //     "../public/upload",
        //     uploadedFile.filename
        // );
        // console.log("File saved at:", filePath);
        // await Files.create({
        //     name: uploadedFile.filename,
        //     product_id: product?._id,
        // });
        // // You can save the file information to a database or perform other actions as needed
        // // Respond to the client
        // res.status(200).json({
        //     success: true,
        //     message: "File uploaded successfully.",
        //     file: uploadedFile,
        // });
        // ============================================================================================
        // if (!product)
        //     throw new MyError(req.params.id + " boook not found...", 404);
        // // image upload
        // const files = req?.files?.file as UploadedFile[];
        // console.log("file size =====>", files);
        // if (files === undefined)
        //     throw new MyError("Please upload file...", 400);
        // if (Array.isArray(files)) {
        //     for (const file of files) {
        //         if (!file.mimetype?.startsWith("image"))
        //             throw new MyError("Please upload image file...", 400);
        //         if (
        //             process.env.MAX_UPLOAD_FILE_SIZE &&
        //             file.size > +process.env.MAX_UPLOAD_FILE_SIZE
        //         )
        //             throw new MyError("Your image's size is too big...", 400);
        //         file.name = `photo_${req.params.id}${new Date().getTime()}${
        //             path.parse(file.name).ext
        //         }`;
        //         file.mv(
        //             `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
        //             async (err: Error) => {
        //                 if (err) throw new MyError(err.message, 400);
        //                 await Files.create({
        //                     name: file.name,
        //                     product_id: product._id,
        //                 });
        //             }
        //         );
        //     }
        //     return res.status(200).json({
        //         success: true,
        //     });
        // }
        // if (!files.mimetype?.startsWith("image"))
        //     throw new MyError("Please upload image file...", 400);
        // if (
        //     process.env.MAX_UPLOAD_FILE_SIZE &&
        //     files.size > +process.env.MAX_UPLOAD_FILE_SIZE
        // )
        //     throw new MyError("Your image's size is too big...", 400);
        // files.name = `photo_${req.params.id}${new Date().getTime()}${
        //     path.parse(files.name).ext
        // }`;
        // console.log(`${process.env.FILE_UPLOAD_PATH}/${files.name}`);
        // files.mv(`../../public/upload/${files.name}`, async (err: Error) => {
        //     console.log("=========> ", err);
        //     if (err) throw new MyError(err.message, 400);
        //     await Files.create({
        //         name: files.name,
        //         product_id: product._id,
        //     });
        //     res.status(200).json({
        //         success: true,
        //     });
        // });
    }
);
