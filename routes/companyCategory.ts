import express from "express";
import bodyparser from "body-parser";
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategory,
    updateCategory,
} from "../controller/companyCategory";
import { adminProtect } from "../middleware/adminProtect";

const companyCategoryRouter = express.Router({ mergeParams: true });

const jsonParser = bodyparser.json();

companyCategoryRouter
    .route("/")
    .get(getCategories)
    .post(adminProtect, jsonParser, createCategory);

companyCategoryRouter
    .route("/:id")
    .get(getCategory)
    .delete(adminProtect, deleteCategory)
    .put(adminProtect, jsonParser, updateCategory);

export default companyCategoryRouter;
