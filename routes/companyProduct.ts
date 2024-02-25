import express from "express";
import {
    createProduct,
    deletePhoto,
    deleteProduct,
    getCategoryProducts,
    getProduct,
    lastProducts,
    updateProduct,
    uploadProductPhoto,
} from "../controller/companyProduct";
import bodyparser from "body-parser";
import { adminProtect } from "../middleware/adminProtect";

const companyProductRouter = express.Router({ mergeParams: true });

const jsonParser = bodyparser.json();

companyProductRouter
    .route("/")
    .get(getCategoryProducts)
    .post(adminProtect, jsonParser, createProduct);

companyProductRouter
    .route("/:id")
    .get(getProduct)
    .delete(adminProtect, deleteProduct)
    .put(adminProtect, jsonParser, updateProduct);

companyProductRouter.route("/last/products").get(lastProducts);

companyProductRouter
    .route("/:id/photo")
    .post(adminProtect, jsonParser, uploadProductPhoto);

companyProductRouter.route("/photo/:id").delete(adminProtect, deletePhoto);

export default companyProductRouter;
