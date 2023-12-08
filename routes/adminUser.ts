import express from "express";
import { login, register } from "../controller/adminUser";
import bodyparser from "body-parser";

const adminUserRouter = express.Router();

const jsonParser = bodyparser.json();

adminUserRouter.route("/").post(jsonParser, register);

adminUserRouter.route("/login").post(jsonParser, login);

export default adminUserRouter;
