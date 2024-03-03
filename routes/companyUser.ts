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
import { companyProtect } from "../middleware/companyProtect";

const companyUserRouter = express.Router();

const jsonParser = bodyparser.json();

companyUserRouter
    .route("/")
    .get(companyProtect, getProfile)
    .post(jsonParser, register);

companyUserRouter.route("/forgetPassword").post(jsonParser, forgetPassword);
companyUserRouter
    .route("/changePassword")
    .post(jsonParser, checkChangePasswordCodeAndChangePassword);

companyUserRouter.route("/login").post(jsonParser, login);

companyUserRouter
    .route("/updateProfile")
    .post(companyProtect, jsonParser, updateProfile);

companyUserRouter
    .route("/updatePassword")
    .post(jsonParser, companyProtect, changePassword);

export default companyUserRouter;
