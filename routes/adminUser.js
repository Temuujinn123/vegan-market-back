"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminUser_1 = require("../controller/adminUser");
const body_parser_1 = __importDefault(require("body-parser"));
const adminUserRouter = express_1.default.Router();
const jsonParser = body_parser_1.default.json();
adminUserRouter.route("/").post(jsonParser, adminUser_1.register);
adminUserRouter.route("/login").post(jsonParser, adminUser_1.login);
exports.default = adminUserRouter;
