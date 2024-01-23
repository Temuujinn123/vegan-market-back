import express from "express";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";
import {
    deleteBannerPhoto,
    getBannerPhotos,
    uploadBannerPhoto,
} from "../controller/bannerFiles";

const bannerFilesRouter = express.Router();

const jsonParser = bodyparser.json();

bannerFilesRouter
    .route("/")
    .get(jsonParser, getBannerPhotos)
    .post(jsonParser, protect, uploadBannerPhoto);

bannerFilesRouter.route("/:id").delete(jsonParser, protect, deleteBannerPhoto);

export default bannerFilesRouter;
