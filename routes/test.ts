import express from "express";
import bodyparser from "body-parser";
import { protect } from "../middleware/protect";
import { createTest } from "../controller/test";

const testRouter = express.Router();

const jsonParser = bodyparser.json();

testRouter.route("/").post(jsonParser, createTest);

export default testRouter;
