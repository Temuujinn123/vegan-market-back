import express, { Request, Response } from "express";
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
import Invoice from "./utils/invoice";
import axios from "axios";
import { btoa } from "buffer";
import filesRouter from "./routes/files";

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

app.use(express.static("public"));
app.use("/upload", express.static("upload"));

const credentials = "TEST_MERCHANT:123456";
const base64Credentials = btoa(credentials);

var options = {
    method: "POST",
    url: "https://merchant-sandbox.qpay.mn/v2/auth/token",
    headers: {
        Authorization: `Basic ${base64Credentials}`,
    },
};

const invoiceData = {
    invoice_code: "TEST_INVOICE",
    sender_invoice_no: "9329873948",
    sender_branch_code: "branch",
    invoice_receiver_code: "terminal",
    invoice_receiver_data: {
        register: "TA89102712",
        name: "Бат",
        email: "info@info.mn",
        phone: "99887766",
    },
    invoice_description: "Invoice description",
    invoice_due_date: null,
    allow_partial: false,
    minimum_amount: null,
    allow_exceed: false,
    maximum_amount: null,
    note: null,
    lines: [
        {
            tax_product_code: null,
            line_description: "Invoice description",
            line_quantity: "1.00",
            line_unit_price: "10000.00",
            note: "",
            surcharges: [
                {
                    surcharge_code: "NONE",
                    description: "Хүргэлтийн зардал",
                    amount: 5000,
                    note: "тэмдэглэл",
                },
            ],
            taxes: [
                {
                    tax_code: "VAT",
                    description: "НӨАТ",
                    amount: 100,
                    note: "тэмдэглэл",
                },
            ],
        },
    ],
};

app.get("/", async (req: Request, res: Response) => {
    // res.status(200).json({ message: "Welcome" });
    // const response = await Invoice();
    let token: string | undefined = undefined;
    await axios(options)
        .then((response) => {
            console.log(response.data);
            token = response.data.access_token;
            // res.status(200).json(response.data);
        })
        .catch((error: any) => {
            console.error(error);
            // res.status(200).json(error.message);
        });

    await axios({
        method: "POST",
        url: "https://merchant-sandbox.qpay.mn/v2/invoice",
        data: invoiceData,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => {
            console.log(response.data);
            res.status(200).json(response.data);
        })
        .catch((error: any) => {
            console.error(error);
            res.status(200).json(error.message);
        });
});

app.use("/api/v1/products", cors(), productRouter);
app.use("/api/v1/categories", cors(), categoryRouter);
app.use("/api/v1/admin", cors(), adminUserRouter);
app.use("/api/v1/user", cors(), userRouter);
app.use("/api/v1/wishlist", cors(), wishlistRouter);
app.use("/api/v1/cart", cors(), cartRouter);
app.use("/api/v1/files", cors(), filesRouter);
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
