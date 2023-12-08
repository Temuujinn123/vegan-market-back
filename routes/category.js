"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const category_1 = require("../controller/category");
const protect_1 = require("../middleware/protect");
const categoryRouter = express_1.default.Router({ mergeParams: true });
const jsonParser = body_parser_1.default.json();
categoryRouter
    .route("/")
    .get(category_1.getCategories)
    .post(protect_1.protect, jsonParser, category_1.createCategory);
categoryRouter
    .route("/:id")
    .get(category_1.getCategory)
    .delete(protect_1.protect, category_1.deleteCategory)
    .put(protect_1.protect, jsonParser, category_1.updateCategory);
exports.default = categoryRouter;
