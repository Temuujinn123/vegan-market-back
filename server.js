"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
const error_1 = __importDefault(require("./middleware/error"));
const product_1 = __importDefault(require("./routes/product"));
const category_1 = __importDefault(require("./routes/category"));
const adminUser_1 = __importDefault(require("./routes/adminUser"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const user_1 = __importDefault(require("./routes/user"));
dotenv_1.default.config({
    path: "./config/config.env",
});
(0, db_1.default)();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use((0, express_fileupload_1.default)());
// app.use(compression());
// app.use(limiter);
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000/",
        "https://vegan-market-front.vercel.app/",
    ],
    optionsSuccessStatus: 200,
}));
app.use(express_1.default.static("public"));
app.use("/upload", express_1.default.static("upload"));
app.get("/", (req, res) => {
    res.status(200).json("Welcome!");
});
app.use("/api/v1/products", (0, cors_1.default)(), product_1.default);
app.use("/api/v1/categories", (0, cors_1.default)(), category_1.default);
app.use("/api/v1/admin", (0, cors_1.default)(), adminUser_1.default);
app.use("/api/v1/user", (0, cors_1.default)(), user_1.default);
app.use(error_1.default);
const server = app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
process.on("unhandledRejection", (err) => {
    console.log(`Error ===> ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});
