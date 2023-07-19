import express from "express";
import dotenv from "dotenv";

dotenv.config({
    path: "./config/config.env",
});

const app = express();

const port = process.env.PORT;

app.get("/", function (req: express.Request, res: express.Response) {
    res.send("GET request to homepage");
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
