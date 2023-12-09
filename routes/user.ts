import express from "express";
import { login, register } from "../controller/user";
import bodyparser from "body-parser";

const userRouter = express.Router();

const jsonParser = bodyparser.json();

userRouter.route("/").post(jsonParser, register);

userRouter.route("/login").post(jsonParser, login);

export default userRouter;
