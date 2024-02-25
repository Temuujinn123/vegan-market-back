import express from "express";
import bodyparser from "body-parser";
import {
    deleteBannerPhoto,
    getBannerPhotos,
    uploadBannerPhoto,
} from "../controller/bannerFiles";
import { adminProtect } from "../middleware/adminProtect";

const bannerFilesRouter = express.Router();

const jsonParser = bodyparser.json();

bannerFilesRouter
    .route("/")
    .get(jsonParser, getBannerPhotos)
    .post(jsonParser, adminProtect, uploadBannerPhoto);

bannerFilesRouter
    .route("/:id")
    .delete(jsonParser, adminProtect, deleteBannerPhoto);

export default bannerFilesRouter;
