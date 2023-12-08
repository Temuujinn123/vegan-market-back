"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = ({ err, req, res, next }) => {
    console.log(err === null || err === void 0 ? void 0 : err.stack);
    console.log(err);
    res.status((err === null || err === void 0 ? void 0 : err.statusCode) || 500).json({
        success: false,
        error: err === null || err === void 0 ? void 0 : err.message,
    });
};
exports.default = errorHandler;
