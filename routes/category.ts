import express from "express";
import bodyparser from "body-parser";
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategory,
    updateCategory,
} from "../controller/category";
import { protect } from "../middleware/protect";

const categoryRouter = express.Router({ mergeParams: true });

const jsonParser = bodyparser.json();

categoryRouter
    .route("/")
    .get(getCategories)
    .post(protect, jsonParser, createCategory);

categoryRouter
    .route("/:id")
    .get(getCategory)
    .delete(protect, deleteCategory)
    .put(protect, jsonParser, updateCategory);

export default categoryRouter;
