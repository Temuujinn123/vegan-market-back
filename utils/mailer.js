"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailTemplate_1 = __importDefault(require("./mailTemplate"));
const message = "Hi there, you were emailed me through nodemailer";
const emailOptions = (from, to, message, subject) => {
    return {
        from,
        to,
        subject,
        text: message,
        html: (0, mailTemplate_1.default)(message),
    };
};
exports.default = emailOptions;
