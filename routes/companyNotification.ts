import express from "express";
import bodyparser from "body-parser";
import {
    changeNotificationStatus,
    getNotifications,
} from "../controller/companyNotification";
import { companyProtect } from "../middleware/companyProtect";

const companyNotificationRouter = express.Router();

const jsonParser = bodyparser.json();

companyNotificationRouter
    .route("/")
    .get(jsonParser, companyProtect, getNotifications);

companyNotificationRouter
    .route("/:id")
    .post(jsonParser, companyProtect, changeNotificationStatus);

export default companyNotificationRouter;
