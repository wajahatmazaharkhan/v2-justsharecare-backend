import ImageKit from "imagekit";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import config from "../../config/config.js";

dotenv.config({});

const imagekit = new ImageKit({
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
});

export const ImagekitFileUploader = async (localFilepath) => {
    try {
        if (!localFilepath) return null;

        // Read file from local storage
        const fileData = fs.readFileSync(localFilepath);

        // Upload to ImageKit
        const result = await imagekit.upload({
            file: fileData.toString("base64"),  // Convert to base64
            fileName: Date.now() + path.extname(localFilepath), 
        });

        // Delete local file after upload
        fs.unlinkSync(localFilepath);

        return result;

    } catch (error) {
        console.log("Error in ImageKit uploader:", error);

        // Always delete local file even if upload fails
        if (fs.existsSync(localFilepath)) {
            fs.unlinkSync(localFilepath);
        }

        return null;
    }
};
