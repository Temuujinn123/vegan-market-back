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

// TODO: protect nemeh

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

productRouter.route("/:id/photo").post(uploadProductPhoto);

productRouter.route("/photo/:id").delete(protect, deletePhoto);

// TODO: protect delete post deer nemeh

export default productRouter;
