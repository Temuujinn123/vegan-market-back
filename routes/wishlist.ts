import express from "express";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";
import {
    checkProductInWishlist,
    createWishlist,
    deleteWishlist,
    getWishlist,
} from "../controller/wishlist";

const wishlistRouter = express.Router();

const jsonParser = bodyparser.json();

wishlistRouter
    .route("/")
    .get(jsonParser, protect, getWishlist)
    .post(jsonParser, protect, createWishlist)
    .delete(jsonParser, protect, deleteWishlist);

wishlistRouter
    .route("/checkProduct")
    .get(jsonParser, protect, checkProductInWishlist);

export default wishlistRouter;
