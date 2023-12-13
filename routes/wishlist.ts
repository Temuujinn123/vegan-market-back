import express from "express";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";
import {
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

export default wishlistRouter;
