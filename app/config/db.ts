import mongoose from "mongoose";
import path from "path";

const connectDB = async () => {
    const mongodb_uri =
        process.env.NODE_ENV === "production"
            ? process.env.PROD_MONGODB_URI
            : process.env.MONGODB_URI;

    const conn = await mongoose.connect(mongodb_uri ?? "", {});

    const publicDirectoryPath = path.join(__dirname, "../../public/upload");

    console.log(publicDirectoryPath);

    console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
