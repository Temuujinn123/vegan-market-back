import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import errorHandler from "./middleware/error";
import productRouter from "./routes/product";
import categoryRouter from "./routes/category";
import adminUserRouter from "./routes/adminUser";
import userRouter from "./routes/user";
import wishlistRouter from "./routes/wishlist";
import cartRouter from "./routes/cart";
import filesRouter from "./routes/files";
import invoiceRouter from "./routes/invoice";
import bannerFilesRouter from "./routes/bannerFiles";
import { v2 as cloudinary } from "cloudinary";
import fileupload from "express-fileupload";
import notificationRouter from "./routes/notification";
import companyUserRouter from "./routes/companyUser";
import companyCategoryRouter from "./routes/companyCategory";
import companyProductRouter from "./routes/companyProduct";
import companyCartRouter from "./routes/companyCart";
import companyNotificationRouter from "./routes/companyNotification";
import companyInvoiceRouter from "./routes/companyInvoice";

dotenv.config({
    path: "./config/config.env",
});

connectDB();

const app = express();

const port = process.env.PORT;

cloudinary.config({
    cloud_name: "dztapoxdr",
    api_key: "828683243165131",
    api_secret: "jlkH5cFuGfN2k53cgDJMv3G1ZN0",
});

// app.use(compression());
// app.use(limiter);

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://vegan-market-front.vercel.app",
            "https://www.e-veganmarket.com",
            "https://e-veganmarket.com",
            "http://localhost:8082",
        ],
        optionsSuccessStatus: 200,
    })
);

app.use(fileupload());

// Serve uploaded images
app.use("/upload", express.static("./public/upload"));

// routers
app.use("/api/v1/products", cors(), productRouter);
app.use("/api/v1/categories", cors(), categoryRouter);
app.use("/api/v1/admin", cors(), adminUserRouter);
app.use("/api/v1/user", cors(), userRouter);
app.use("/api/v1/wishlist", cors(), wishlistRouter);
app.use("/api/v1/cart", cors(), cartRouter);
app.use("/api/v1/files", cors(), filesRouter);
app.use("/api/v1/invoice", cors(), invoiceRouter);
app.use("/api/v1/banner", cors(), bannerFilesRouter);
app.use("/api/v1/notifications", cors(), notificationRouter);

// company routers
app.use("/api/v1/company/user", cors(), companyUserRouter);
app.use("/api/v1/company/categories", cors(), companyCategoryRouter);
app.use("/api/v1/company/products", cors(), companyProductRouter);
app.use("/api/v1/company/cart", cors(), companyCartRouter);
app.use("/api/v1/company/notifications", cors(), companyNotificationRouter);
app.use("/api/v1/company/invoice", cors(), companyInvoiceRouter);

app.use(errorHandler);

const server = app.listen(port, () => {
    const address = server.address();
    console.log(`Server is running on ${process.env.PORT}`);
});

process.on("unhandledRejection", (err: any) => {
    console.log(`Error ===> ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});
