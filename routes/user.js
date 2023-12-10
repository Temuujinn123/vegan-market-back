"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controller/user");
const body_parser_1 = __importDefault(require("body-parser"));
const userRouter = express_1.default.Router();
const jsonParser = body_parser_1.default.json();
userRouter.route("/").post(jsonParser, user_1.register);
userRouter.route("/forgetPassword").post(jsonParser, user_1.forgetPassword);
userRouter
    .route("/changePassword")
    .post(jsonParser, user_1.checkChangePasswordCodeAndChangePassword);
userRouter.route("/login").post(jsonParser, user_1.login);
exports.default = userRouter;
