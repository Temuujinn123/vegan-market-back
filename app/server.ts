import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import errorHandler from "./middleware/error";
import productRouter from "./routes/product";
import categoryRouter from "./routes/category";
import adminUserRouter from "./routes/adminUser";
import fileUpload from "express-fileupload";
import compression from "compression";
import limiter from "express-rate-limit";
import userRouter from "./routes/user";
import wishlistRouter from "./routes/wishlist";
import cartRouter from "./routes/cart";
import filesRouter from "./routes/files";
import invoiceRouter from "./routes/invoice";
import bannerFilesRouter from "./routes/bannerFiles";
import path from "path";

dotenv.config({
    path: "./config/config.env",
});

connectDB();

const app = express();

const port = process.env.PORT;

app.use(fileUpload());
// app.use(compression());
// app.use(limiter);

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://vegan-market-front.vercel.app",
        ],
        optionsSuccessStatus: 200,
    })
);

const publicDirectoryPath = path.join(__dirname, "../public/upload");

app.use("/upload", express.static(publicDirectoryPath));
// app.use(express.static("../public"));
// app.use("/upload", express.static("upload"));

app.use("/api/v1/products", cors(), productRouter);
app.use("/api/v1/categories", cors(), categoryRouter);
app.use("/api/v1/admin", cors(), adminUserRouter);
app.use("/api/v1/user", cors(), userRouter);
app.use("/api/v1/wishlist", cors(), wishlistRouter);
app.use("/api/v1/cart", cors(), cartRouter);
app.use("/api/v1/files", cors(), filesRouter);
app.use("/api/v1/invoice", cors(), invoiceRouter);
app.use("/api/v1/banner", cors(), bannerFilesRouter);

// app.use(passport.initialize());

// app.get(
//     "/auth/google",
//     passport.authenticate("google", { scope: ["profile", "email"] })
// );

app.post(
    "/auth/google/callback",
    async (req: Request, res: Response, next: NextFunction) => {
        console.log("========================> ", req.body);
        res.status(200).json({
            success: true,
        });
    }
);

// app.get(
//     "/auth/google/callback",
//     passport.authenticate("google", { failureRedirect: "/" }),
//     (req, res) => {
//         // Successful authentication, redirect to the frontend
//         res.redirect("http://localhost:3000"); // Adjust this URL based on your Next.js frontend URL
//     }
// );

app.use(errorHandler);

const server = app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

process.on("unhandledRejection", (err: any) => {
    console.log(`Error ===> ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});