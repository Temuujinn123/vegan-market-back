"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.getCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const paginate_1 = __importDefault(require("../utils/paginate"));
const myError_1 = __importDefault(require("../utils/myError"));
const Category_1 = __importDefault(require("../models/Category"));
exports.getCategories = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    const page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const select = req.query.select;
    const sort = req.query.sort;
    const search = (_a = req.query.search) !== null && _a !== void 0 ? _a : "";
    ["select", "sort", "page", "limit", "search"].forEach((el) => delete req.query[el]);
    if (page === 1)
        limit = 10000;
    const pagination = await (0, paginate_1.default)(page, limit, Category_1.default);
    const nameRegex = new RegExp(search, "i");
    const categories = await Category_1.default.find({ name: { $regex: nameRegex } }, select)
        .sort(sort)
        .skip(pagination.start - 1)
        .limit(limit)
        .where("is_deleted")
        .equals(false);
    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
        pagination,
    });
});
exports.createCategory = (0, express_async_handler_1.default)(async (req, res, next) => {
    const category = await Category_1.default.create(req.body);
    res.status(200).json({
        success: true,
        data: category,
    });
});
exports.updateCategory = (0, express_async_handler_1.default)(async (req, res, next) => {
    const category = await Category_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updated_at: Date.now() }), {
        new: true,
        runValidators: true,
    });
    if (!category)
        throw new myError_1.default(req.params.id + " is not found...", 404);
    res.status(200).json({
        success: true,
        data: category,
    });
});
exports.getCategory = (0, express_async_handler_1.default)(async (req, res, next) => {
    const category = await Category_1.default.findById(req.params.id);
    if (!category)
        throw new myError_1.default(req.params.id + " is not found...", 400);
    res.status(200).json({
        success: true,
        data: category,
    });
});
exports.deleteCategory = (0, express_async_handler_1.default)(async (req, res, next) => {
    const category = await Category_1.default.findByIdAndUpdate(req.params.id, { is_deleted: true, updated_at: Date.now() });
    if (!category)
        throw new myError_1.default(req.params.id + " is not found...", 404);
    res.status(200).json({
        success: true,
        data: category,
    });
});
