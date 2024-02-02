import { NextFunction, Request, Response } from "express";
import Pagintate from "../utils/paginate";
import MyError from "../utils/myError";
import Category from "../models/Category";
import { ICategory } from "../types/category";
import asyncHandler from "../middleware/asyncHandler";
import SubCategory from "../models/SubCategory";

export const getCategories = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const select = req.query.select;
        const sort = req.query.sort;
        const search = req.query.search ?? "";
        const isAll = req.query.is_all ?? false;

        ["select", "sort", "page", "limit", "search", "is_all"].forEach(
            (el) => delete req.query[el]
        );

        if (page === 1) limit = 10000;

        const pagination = await Pagintate(
            page as number,
            limit as number,
            Category
        );

        const nameRegex = new RegExp(search as string, "i");

        if (Boolean(isAll)) {
            const categories = await Category.find(
                { name: { $regex: nameRegex } },
                select
            )
                .sort(sort as string)
                .skip(pagination.start - 1)
                .limit(limit as number)
                .where("is_deleted")
                .equals(false);

            res.status(200).json({
                success: true,
                count: categories.length,
                data: categories,
                pagination,
            });
            return;
        }

        const categories = await Category.find(
            { name: { $regex: nameRegex } },
            select
        )
            .populate({
                path: "sub_categories",
                match: { is_deleted: false },
            })
            .sort(sort as string)
            .skip(pagination.start - 1)
            .limit(limit as number)
            .where("is_deleted")
            .equals(false);

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
            pagination,
        });
    }
);

export const createCategory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, isSubCategory, categoryId } = req.body;

        if (!name) throw new MyError("Name is required...", 400);

        if (isSubCategory && Boolean(isSubCategory) && categoryId) {
            const subCategory = await SubCategory.create({
                name,
                parent_category_id: categoryId,
            });

            return res.status(200).json({
                success: true,
                data: subCategory,
            });
        }

        const category: ICategory = await Category.create({ name });
        res.status(200).json({
            success: true,
            data: category,
        });
    }
);

export const updateCategory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const category: ICategory | null = await Category.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updated_at: Date.now() },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!category)
            throw new MyError(req.params.id + " is not found...", 404);

        res.status(200).json({
            success: true,
            data: category,
        });
    }
);

export const getCategory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const category: ICategory | null = await Category.findById(
            req.params.id
        );

        if (!category)
            throw new MyError(req.params.id + " is not found...", 400);

        res.status(200).json({
            success: true,
            data: category,
        });
    }
);

export const deleteCategory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const category: ICategory | null = await Category.findByIdAndUpdate(
            req.params.id,
            { is_deleted: true, updated_at: Date.now() }
        );

        if (!category)
            throw new MyError(req.params.id + " is not found...", 404);

        res.status(200).json({
            success: true,
            data: category,
        });
    }
);
