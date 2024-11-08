import { NextFunction, Request, Response } from "express";
import MyError from "../utils/myError";
import asyncHandler from "../middleware/asyncHandler";
import Cart from "../models/Cart";
import { ICompanyUser } from "../types/companyUser";
import CompanyUser from "../models/CompanyUser";
import { generateRandomNumber } from "../utils/generateRandom";
import Pagintate from "../utils/paginate";

export const getUsers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const select = req.query.select;
        const sort = req.query.sort;
        const search = req.query.search || "";

        ["select", "sort", "page", "limit", "search"].forEach(
            (el) => delete req.query[el]
        );

        if (page === 1) limit = 10000;

        const pagination = await Pagintate(
            page as number,
            limit as number,
            CompanyUser
        );

        const nameRegex = new RegExp(search as string, "i");

        let filter: any = {};

        if (nameRegex) {
            filter.company_name = {
                $regex: nameRegex,
            };
        }

        const users = await CompanyUser.find({ ...filter }, select)
            .sort(sort as string)
            .skip(pagination.start - 1)
            .limit(limit as number);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
            pagination,
        });
    }
);

export const register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        let { company_code }: { company_code: string | null } = req.body;

        if (company_code === null) {
            company_code = generateRandomNumber(7);
        }

        const user: ICompanyUser = await CompanyUser.create({
            ...req.body,
            company_code: parseInt(company_code),
        });

        const token: string = (user as any).getJsonWebToken();

        await Cart.create({
            user_id: user._id,
        });

        res.status(200).json({
            success: true,
            token,
            user,
        });
    }
);

export const login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { companyName, password } = req.body;

        if (!companyName || !password) {
            throw new MyError(
                "Please insert your company name and password.",
                400
            );
        }

        const user: ICompanyUser = await CompanyUser.findOne({
            company_name: companyName,
        }).select("+password");

        if (!user) {
            throw new MyError("Company name or password's are incorrect.", 401);
        }

        const isOk = await (user as any).checkPassword(password);

        if (!isOk) {
            throw new MyError("Company name or password's are incorrect.", 401);
        }

        res.status(200).json({
            success: true,
            token: (user as any).getJsonWebToken(),
        });
    }
);

export const getProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user) {
            throw new MyError("Can't find user.", 404);
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    }
);

export const updateProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = (req as any).user;
        const {
            address,
            name,
            phone_number,
        }: {
            address: string;
            name: string;
            phone_number: number;
        } = req.body;

        if (!_id) {
            throw new MyError("Can't find user", 404);
        }

        const user: ICompanyUser | null | undefined =
            await CompanyUser.findByIdAndUpdate(_id, {
                address,
                name,
                phone_number,
            });

        if (!user) {
            throw new MyError("Can't find user", 404);
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    }
);

export const updateUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await CompanyUser.findByIdAndUpdate(req.params.id, {
            ...req.body,
        });

        if (!user) throw new MyError(req.params.id + " is not found...", 404);

        res.status(200).json({
            success: true,
            data: user,
        });
    }
);

export const deleteUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        await CompanyUser.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
        });
    }
);

export const getUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await CompanyUser.findById(req.params.id).select([
            "company_name",
            "company_code",
            "email",
            "address",
            "phone_number",
            "password",
        ]);

        res.status(200).json({
            success: true,
            data: user,
        });
    }
);
