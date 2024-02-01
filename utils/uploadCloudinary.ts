import { v2 as cloudinary } from "cloudinary";
import { getIPAddress } from "../server";

const uploadImageToCloudinary = async (fileName: string) => {
    try {
        const result = await cloudinary.uploader.upload(
            `${getIPAddress()}/upload/${fileName}`,
            {
                public_id: fileName,
            },
            (error, result) => {
                if (error || !result) {
                    console.error("Error uploading file:", error);
                    throw error;
                }
                console.log(
                    "File uploaded successfully. URL:",
                    result.secure_url
                );
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
