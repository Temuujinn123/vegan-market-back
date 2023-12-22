import express from "express";
import {
    checkChangePasswordCodeAndChangePassword,
    forgetPassword,
    getProfile,
    login,
    register,
    sendSMSToPhone,
    updateProfile,
} from "../controller/user";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";

const userRouter = express.Router();

const jsonParser = bodyparser.json();

userRouter.route("/").get(protect, getProfile).post(jsonParser, register);

userRouter.route("/forgetPassword").post(jsonParser, forgetPassword);
userRouter
    .route("/changePassword")
    .post(jsonParser, checkChangePasswordCodeAndChangePassword);

userRouter.route("/login").post(jsonParser, login);

userRouter.route("/updateProfile").post(protect, jsonParser, updateProfile);

userRouter.route("/sendSMS").post(jsonParser, sendSMSToPhone);

// userRouter
//     .route("/changeMail/code")
//     .post(protect, jsonParser, sendChangeMailCode);

export default userRouter;
