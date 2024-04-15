import { v2 as cloudinary } from "cloudinary";

const uploadImageToCloudinary = async (fileName: string) => {
    try {
        const result = await cloudinary.uploader.upload(
            `https://vegan-market-api.up.railway.app/upload/${fileName}`,
            {
                public_id: fileName,
            },
            (error, result) => {
                if (error || !result) {
                    console.error("Error uploading file:", error);
                    throw error;
                }
                // Return or use result.secure_url as the URL of the uploaded file
            }
        );

        return result.secure_url;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

export default uploadImageToCloudinary;
