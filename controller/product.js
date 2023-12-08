"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductPhoto = exports.deleteProduct = exports.getProduct = exports.updateProduct = exports.createProduct = exports.lastProducts = exports.getCategoryProducts = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const paginate_1 = __importDefault(require("../utils/paginate"));
const Product_1 = __importDefault(require("../models/Product"));
const myError_1 = __importDefault(require("../utils/myError"));
const path_1 = __importDefault(require("path"));
const Category_1 = __importDefault(require("../models/Category"));
exports.getCategoryProducts = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const select = req.query.select;
    const sort = req.query.sort;
    const search = req.query.search || "";
    const category = ((_a = req.query.category) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
    const pagination = await (0, paginate_1.default)(page, limit, Product_1.default);
    const nameRegex = new RegExp(search, "i");
    let products;
    if (category.length !== 0) {
        products = await Product_1.default.find({
            name: { $regex: nameRegex },
            category: { $in: category },
        }, select)
            .populate({
            path: "category",
        })
            .sort(sort)
            .skip(pagination.start - 1)
            .limit(limit)
            .where("is_deleted")
            .equals(false);
    }
    else {
        products = await Product_1.default.find({
            name: { $regex: nameRegex },
        }, select)
            .populate({
            path: "category",
        })
            .sort(sort)
            .skip(pagination.start - 1)
            .limit(limit)
            .where("is_deleted")
            .equals(false);
    }
    res.status(200).json({
        success: true,
        count: products.length,
        data: products,
        pagination,
    });
});
exports.lastProducts = (0, express_async_handler_1.default)(async (req, res, next) => {
    const products = await Product_1.default.find()
        .sort({ created_at: -1 })
        .limit(3)
        .where("is_deleted")
        .equals(false);
    if (!products)
        throw new myError_1.default("Product not found", 400);
    res.status(200).json({
        success: true,
        data: products,
    });
});
exports.createProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const category = await Category_1.default.findById(req.body.category);
    if (!category)
        throw new myError_1.default(req.body.product + " is not found...", 400);
    const product = await Product_1.default.create(req.body);
    res.status(200).json({
        success: true,
        data: product,
    });
});
exports.updateProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const product = await Product_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updated_at: Date.now() }), {
        new: true,
        runValidators: true,
    });
    if (!product)
        throw new myError_1.default(req.params.id + " is not found...", 404);
    res.status(200).json({
        success: true,
        data: product,
    });
});
exports.getProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const product = await Product_1.default.findById(req.params.id).populate({
        path: "category",
    });
    if (!product)
        throw new myError_1.default(req.params.id + " is not found...", 400);
    res.status(200).json({
        success: true,
        data: product,
    });
});
exports.deleteProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const product = await Product_1.default.findByIdAndUpdate(req.params.id, { is_deleted: true, updated_at: Date.now() });
    if (!product)
        throw new myError_1.default(req.params.id + " is not found...", 404);
    res.status(200).json({
        success: true,
        data: product,
    });
});
exports.uploadProductPhoto = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    const product = await Product_1.default.findById(req.params.id);
    if (!product)
        throw new myError_1.default(req.params.id + " boook not found...", 404);
    // image upload
    const file = req.files.file;
    console.log("file size =====>", file.size);
    if (!((_a = file.mimetype) === null || _a === void 0 ? void 0 : _a.startsWith("image")))
        throw new myError_1.default("Please upload image file...", 400);
    if (process.env.MAX_UPLOAD_FILE_SIZE &&
        file.size > process.env.MAX_UPLOAD_FILE_SIZE)
        throw new myError_1.default("Your image's size is too big...", 400);
    file.name = `photo_${req.params.id}${path_1.default.parse(file.name).ext}`;
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
        if (err)
            throw new myError_1.default(err.message, 400);
        product.img = file.name;
        product.save();
        res.status(200).json({
            success: true,
            data: file.name,
        });
    });
});
