"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkChangePasswordCodeAndChangePassword = exports.forgetPassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const myError_1 = __importDefault(require("../utils/myError"));
const User_1 = __importDefault(require("../models/User"));
const mail_1 = __importDefault(require("../utils/mail"));
const mailer_1 = __importDefault(require("../utils/mailer"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
exports.register = (0, asyncHandler_1.default)(async (req, res, next) => {
    const user = await User_1.default.create(req.body);
    const token = user.getJsonWebToken();
    res.status(200).json({
        success: true,
        token,
        user,
    });
});
exports.login = (0, asyncHandler_1.default)(async (req, res, next) => {
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
function generateCode() {
    let code = "";
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 1; i <= 6; i++) {
        let char = Math.floor(Math.random() * str.length + 1);
        code += str.charAt(char);
    }
    return code;
}
exports.forgetPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new myError_1.default("Please insert your email.", 400);
    }
    const user = await User_1.default.findOne({ email });
    if (!user) {
        throw new myError_1.default("Can't find account with this email", 400);
    }
    const code = generateCode();
    const { success } = await (0, mail_1.default)((0, mailer_1.default)("temuuujinn8563@gmail.com", email, `Your code to change your account password is ${code}`, "Change password"), (info) => {
        console.log("Email sent successfully");
        console.log("MESSAGE ID: ", info.messageId);
    });
    if (success) {
        const result = await User_1.default.findByIdAndUpdate(user._id, {
            resetPasswordToken: code,
            resetPasswordExpire: new Date(new Date().setDate(new Date().getDate() + 1)),
        }, {
            new: true,
            runValidators: true,
        });
        console.log("result ===========> ", result);
        res.status(200).json({ success: true });
    }
    else {
        res.status(200).json({ success: false });
    }
});
exports.checkChangePasswordCodeAndChangePassword = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { email, code, newPassword, } = req.body;
    if (!email || !code || !newPassword)
        throw new myError_1.default("Please insert your code to change your password", 400);
    const user = await User_1.default.findOne({ email }).select([
        "+resetPasswordToken",
        "+resetPasswordExpire",
    ]);
    if (!user)
        throw new myError_1.default("Can't find account with this email", 400);
    if (code === user.resetPasswordToken &&
        new Date().getTime() < user.resetPasswordExpire.getTime()) {
        const salt = await bcrypt_1.default.genSalt(10);
        const password = await bcrypt_1.default.hash(newPassword, salt);
        await User_1.default.findByIdAndUpdate(user._id, {
            password,
        });
        res.status(200).json({
            success: true,
        });
    }
    else {
        throw new myError_1.default("Code is wrong", 400);
    }
});
