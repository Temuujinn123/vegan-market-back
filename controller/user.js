"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const myError_1 = __importDefault(require("../utils/myError"));
const User_1 = __importDefault(require("../models/User"));
exports.register = (0, express_async_handler_1.default)(async (req, res, next) => {
    const user = await User_1.default.create(req.body);
    const token = user.getJsonWebToken();
    res.status(200).json({
        success: true,
        token,
        user,
    });
});
exports.login = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new myError_1.default("Please insert your email and password.", 400);
    }
    const user = await User_1.default.findOne({ email }).select("+password");
    if (!user) {
        throw new myError_1.default("Email or password's are incorrect.", 401);
    }
    const isOk = await user.checkPassword(password);
    if (!isOk) {
        throw new myError_1.default("Email or password's are incorrect.", 401);
    }
    res.status(200).json({
        success: true,
        token: user.getJsonWebToken(),
    });
});
