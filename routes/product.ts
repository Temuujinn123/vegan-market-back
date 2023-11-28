import express from "express";
import { getProducts } from "../controller/product";

const productRouter = express.Router({ mergeParams: true });

productRouter.route("/").get(getProducts);

export default productRouter;
