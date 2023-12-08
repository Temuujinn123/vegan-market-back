"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = require("../controller/product");
const protect_1 = require("../middleware/protect");
const body_parser_1 = __importDefault(require("body-parser"));
const productRouter = express_1.default.Router({ mergeParams: true });
const jsonParser = body_parser_1.default.json();
// TODO: protect nemeh
productRouter
    .route("/")
    .get(product_1.getCategoryProducts)
    .post(protect_1.protect, jsonParser, product_1.createProduct);
productRouter
    .route("/:id")
    .get(product_1.getProduct)
    .delete(protect_1.protect, product_1.deleteProduct)
    .put(protect_1.protect, jsonParser, product_1.updateProduct);
productRouter.route("/last/products").get(product_1.lastProducts);
productRouter.route("/:id/photo").post(product_1.uploadProductPhoto);
// TODO: protect delete post deer nemeh
exports.default = productRouter;
