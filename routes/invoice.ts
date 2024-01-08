import express from "express";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";
import { createInvoice, getInvoices } from "../controller/invoice";

const invoiceRouter = express.Router();

const jsonParser = bodyparser.json();

invoiceRouter.route("/").get(jsonParser, getInvoices);
invoiceRouter.route("/create").post(jsonParser, protect, createInvoice);

// invoiceRouter
// .route("/:id")
// .get(jsonParser, protect, getCart)
// .post(jsonParser, protect, createCart)
// .delete(jsonParser, protect, deleteCart);

// invoiceRouter.route("/quantity").get(jsonParser, protect, changeQuantityOfCart);

export default invoiceRouter;
