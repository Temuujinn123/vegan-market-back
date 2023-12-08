"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const myError_1 = __importDefault(require("../utils/myError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    if (!req.headers.authorization) {
        throw new myError_1.default("Please login first.", 401);
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        throw new myError_1.default("Please login first.", 400);
    }
    const tokenobj = jsonwebtoken_1.default.verify(token, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "");
    // req.user = User.findById(tokenobj.id);
    next();
});
