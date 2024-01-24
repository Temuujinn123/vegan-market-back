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

const productRouter = express.Router({ mergeParams: true });

const jsonParser = bodyparser.json();
const urlencoded = bodyparser.urlencoded({ extended: true });

productRouter
    .route("/")
    .get(getCategoryProducts)
    .post(protect, jsonParser, createProduct);

productRouter
    .route("/:id")
    .get(getProduct)
    .delete(protect, deleteProduct)
    .put(protect, jsonParser, updateProduct);

productRouter.route("/last/products").get(lastProducts);

productRouter.route("/:id/photo").post(protect, jsonParser, uploadProductPhoto);

productRouter.route("/photo/:id").delete(protect, deletePhoto);

export default productRouter;
