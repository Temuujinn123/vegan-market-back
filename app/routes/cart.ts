import express from "express";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";
import {
    changeQuantityOfCart,
    createCart,
    deleteCart,
    getCart,
} from "../controller/cart";

const cartRouter = express.Router();

const jsonParser = bodyparser.json();

cartRouter
    .route("/")
    .get(jsonParser, protect, getCart)
    .post(jsonParser, protect, createCart)
    .delete(jsonParser, protect, deleteCart);

cartRouter.route("/quantity").get(jsonParser, protect, changeQuantityOfCart);

export default cartRouter;
