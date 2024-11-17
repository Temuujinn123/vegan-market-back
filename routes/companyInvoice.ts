import express from "express";
import bodyparser from "body-parser";
import {
    confirmInvoicePayment,
    createInvoice,
    createInvoioceExcel,
    getInvoice,
    getInvoices,
    updateInvoice,
} from "../controller/companyInvoice";
import { adminProtect } from "../middleware/adminProtect";
import { companyProtect } from "../middleware/companyProtect";

const companyInvoiceRouter = express.Router();

const jsonParser = bodyparser.json();

companyInvoiceRouter.route("").get(jsonParser, companyProtect, getInvoices);

companyInvoiceRouter
    .route("/:id")
    .get(jsonParser, companyProtect, getInvoice)
    .put(jsonParser, adminProtect, updateInvoice);

companyInvoiceRouter
    .route("/create")
    .post(jsonParser, companyProtect, createInvoice);

companyInvoiceRouter.route("/payment").get(jsonParser, confirmInvoicePayment);

companyInvoiceRouter
    .route("/getExcel/:id")
    .get(jsonParser, createInvoioceExcel);

export default companyInvoiceRouter;
