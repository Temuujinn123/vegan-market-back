import express from "express";
import bodyparser from "body-parser";
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategory,
    updateCategory,
} from "../controller/category";
import { adminProtect } from "../middleware/adminProtect";

const categoryRouter = express.Router({ mergeParams: true });

const jsonParser = bodyparser.json();

categoryRouter
    .route("/")
    .get(getCategories)
    .post(adminProtect, jsonParser, createCategory);

categoryRouter
    .route("/:id")
    .get(getCategory)
    .delete(adminProtect, deleteCategory)
    .put(adminProtect, jsonParser, updateCategory);

export default categoryRouter;
