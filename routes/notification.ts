import express from "express";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";
import {
    changeNotificationStatus,
    getNotifications,
} from "../controller/notification";

const notificationRouter = express.Router();

const jsonParser = bodyparser.json();

notificationRouter.route("/").get(jsonParser, protect, getNotifications);

notificationRouter
    .route("/:id")
    .post(jsonParser, protect, changeNotificationStatus);

export default notificationRouter;
