import express from "express";
import {
    createProduct,
    deletePhoto,
    deleteProduct,
    getCategoryProducts,
    getProduct,
    lastProducts,
    updateProduct,
    uploadProductPhoto,
} from "../controller/product";
import { protect } from "../middleware/protect";
import bodyparser from "body-parser";
import multer from "multer";
import path from "path";

const productRouter = express.Router({ mergeParams: true });

const jsonParser = bodyparser.json();

productRouter
    .route("/")
    .get(getCategoryProducts)
    .post(protect, jsonParser, createProduct);

productRouter
    .route("/:id")
    .get(getProduct)
    .delete(protect, deleteProduct)
    .put(protect, jsonParser, updateProduct);

productRouter.route("/last/products").get(lastProducts);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../public/upload"); // Specify the directory to save the uploaded files
    },
    filename: (req, file, cb) => {
        const fileName = `photo_${req.params.id}${new Date().getTime()}${
            path.parse(file.originalname).ext
        }`;
        cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

productRouter
    .route("/:id/photo")
    .post(protect, upload.single("image"), uploadProductPhoto);

productRouter.route("/photo/:id").delete(protect, deletePhoto);

export default productRouter;
