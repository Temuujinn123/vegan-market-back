import express from "express";
import { deletePhoto } from "../controller/product";
import { protect } from "../middleware/protect";
import bodyparser from "body-parser";

const filesRouter = express.Router({ mergeParams: true });

const jsonParser = bodyparser.json();

export default filesRouter;
