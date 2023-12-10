"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "temuujinn8563@gmail.com",
        pass: "lwsa bpve aevi zowv",
    },
});
const SendMail = async (mailDetails, callback) => {
    try {
        const info = await transporter.sendMail(mailDetails);
        callback(info);
        return { success: true };
    }
    catch (error) {
        console.log(error);
        return { success: false };
    }
};
exports.default = SendMail;
