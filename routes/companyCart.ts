import express from "express";
import bodyparser from "body-parser";
import {
    changeQuantityOfCart,
    createCart,
    deleteCart,
    getCart,
} from "../controller/companyCart";
import { companyProtect } from "../middleware/companyProtect";

const companyCartRouter = express.Router();

const jsonParser = bodyparser.json();

companyCartRouter
    .route("/")
    .get(jsonParser, companyProtect, getCart)
    .post(jsonParser, companyProtect, createCart)
    .delete(jsonParser, companyProtect, deleteCart);

companyCartRouter
    .route("/quantity")
    .get(jsonParser, companyProtect, changeQuantityOfCart);

export default companyCartRouter;
