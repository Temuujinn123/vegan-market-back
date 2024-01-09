import mongoose from "mongoose";

const TestSchema = new mongoose.Schema<any>({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
});

export default mongoose.model("Test", TestSchema);
