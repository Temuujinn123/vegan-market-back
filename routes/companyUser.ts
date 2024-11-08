import express from "express";
import {
    deleteUser,
    getProfile,
    getUser,
    getUsers,
    login,
    register,
    updateProfile,
    updateUser,
} from "../controller/companyUser";
import bodyparser from "body-parser";
import { companyProtect } from "../middleware/companyProtect";
import { adminProtect } from "../middleware/adminProtect";

const companyUserRouter = express.Router();

const jsonParser = bodyparser.json();

companyUserRouter
    .route("/")
    .get(adminProtect, getUsers)
    .post(adminProtect, jsonParser, register);

companyUserRouter
    .route("/:id")
    .get(adminProtect, getUser)
    .delete(adminProtect, deleteUser)
    .put(adminProtect, jsonParser, updateUser);

companyUserRouter.route("/login").post(jsonParser, login);

companyUserRouter.route("/getProfile").get(companyProtect, getProfile);

companyUserRouter
    .route("/updateProfile")
    .post(companyProtect, jsonParser, updateProfile);

export default companyUserRouter;
