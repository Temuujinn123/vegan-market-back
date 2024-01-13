import express from "express";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";
import {
    confirmInvoicePayment,
    createInvoice,
    getInvoice,
    getInvoices,
    updateInvoice,
} from "../controller/invoice";

const invoiceRouter = express.Router();

const jsonParser = bodyparser.json();

invoiceRouter.route("/").get(jsonParser, protect, getInvoices);

invoiceRouter
    .route("/:id")
    .get(jsonParser, protect, getInvoice)
    .put(jsonParser, protect, updateInvoice);

invoiceRouter.route("/create").post(jsonParser, protect, createInvoice);

invoiceRouter.route("/payment").post(jsonParser, confirmInvoicePayment);

export default invoiceRouter;
