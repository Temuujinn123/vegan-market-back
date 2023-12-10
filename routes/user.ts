import express from "express";
import {
    checkChangePasswordCodeAndChangePassword,
    forgetPassword,
    login,
    register,
} from "../controller/user";
import bodyparser from "body-parser";

const userRouter = express.Router();

const jsonParser = bodyparser.json();

userRouter.route("/").post(jsonParser, register);

userRouter.route("/forgetPassword").post(jsonParser, forgetPassword);
userRouter
    .route("/changePassword")
    .post(jsonParser, checkChangePasswordCodeAndChangePassword);

userRouter.route("/login").post(jsonParser, login);

export default userRouter;
