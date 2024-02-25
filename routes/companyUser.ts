import express from "express";
import {
    changePassword,
    checkChangePasswordCodeAndChangePassword,
    forgetPassword,
    getProfile,
    login,
    register,
    updateProfile,
} from "../controller/companyUser";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";

const companyUserRouter = express.Router();

const jsonParser = bodyparser.json();

companyUserRouter
    .route("/")
    .get(protect, getProfile)
    .post(jsonParser, register);

companyUserRouter.route("/forgetPassword").post(jsonParser, forgetPassword);
companyUserRouter
    .route("/changePassword")
    .post(jsonParser, checkChangePasswordCodeAndChangePassword);

companyUserRouter.route("/login").post(jsonParser, login);

companyUserRouter
    .route("/updateProfile")
    .post(protect, jsonParser, updateProfile);

companyUserRouter
    .route("/updatePassword")
    .post(jsonParser, protect, changePassword);

export default companyUserRouter;
