import mongoose from "mongoose";

const connectDB = async () => {
    const mongodb_uri =
        process.env.NODE_ENV === "production"
            ? process.env.PROD_MONGODB_URI
            : process.env.MONGODB_URI;

    const conn = await mongoose.connect(mongodb_uri ?? "", {});

    console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
