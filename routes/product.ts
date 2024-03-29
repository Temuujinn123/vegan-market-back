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
} from "../controller/product";
import { protect } from "../middleware/protect";
import bodyparser from "body-parser";
import { adminProtect } from "../middleware/adminProtect";

const productRouter = express.Router({ mergeParams: true });

const jsonParser = bodyparser.json();

productRouter
    .route("/")
    .get(getCategoryProducts)
    .post(adminProtect, jsonParser, createProduct);

productRouter
    .route("/:id")
    .get(getProduct)
    .delete(adminProtect, deleteProduct)
    .put(adminProtect, jsonParser, updateProduct);

productRouter.route("/last/products").get(lastProducts);

productRouter
    .route("/:id/photo")
    .post(adminProtect, jsonParser, uploadProductPhoto);

productRouter.route("/photo/:id").delete(adminProtect, deletePhoto);

export default productRouter;
