import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, getBytes } from "firebase/storage";

const storage = getStorage();

/**
 * Upload an image to Firebase Storage
 * 
 * @param {File} file - The file to upload
 * @param {string} folder - The folder name in storage (e.g., "paddleImages", "ballImages")
 * @param {string} orderId - The order ID to use in filename
 * @param {string} fileType - The type of file (e.g., "paddleImage", "ballImage", "paymentReceipt")
 * @param {boolean} isTemp - Whether to upload to tempUploads folder (default: true)
 * @returns {Promise<Object|null>} Object with downloadURL and uniqueFileName, or null if failed
 */
export const uploadImageToStorage = async (
    file,
    folder,
    orderId,
    fileType,
    isTemp = true
) => {
    if (!file || !file.name) {
        console.error("Missing or invalid file");
        return null;
    }

    try {
        // Extract file extension
        const fileExtension = file.name.split(".").pop().toLowerCase();

        // Create unique filename: orderId_fileType.extension
        const uniqueFileName = `${orderId}_${fileType}.${fileExtension}`;

        // Determine folder (tempUploads if temporary, otherwise use specified folder)
        const targetFolder = isTemp ? "tempUploads" : folder;
        const fileRef = ref(storage, `${targetFolder}/${uniqueFileName}`);

        // Define MIME types for common image formats
        const mimeTypes = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            gif: "image/gif",
            bmp: "image/bmp",
            pdf: "application/pdf",
        };

        // Get content type from file extension or use file.type
        const contentType = mimeTypes[fileExtension] || file.type || "image/png";
        const metadata = { contentType };

        // Upload file with metadata
        await uploadBytes(fileRef, file, metadata);

        // Get download URL
        const downloadURL = await getDownloadURL(fileRef);

        return { downloadURL, uniqueFileName };
    } catch (error) {
        console.error(`Error uploading to ${folder}:`, error);
        return null;
    }
};

/**
 * Move a file from tempUploads to final storage location
 * 
 * @param {string} tempFilename - The filename in tempUploads
 * @param {string} finalFolder - The final destination folder
 * @returns {Promise<string|null>} Final download URL or null if failed
 */
export const finalizeImageUpload = async (tempFilename, finalFolder) => {
    try {
        const tempRef = ref(storage, `tempUploads/${tempFilename}`);
        const finalRef = ref(storage, `${finalFolder}/${tempFilename}`);




        // Step 1: Download file bytes from temp storage
        const fileData = await getBytes(tempRef);
        if (!fileData) throw new Error("File not found in temp storage");

        // Step 2: Determine the correct MIME type from filename
        let contentType = "image/png"; // Default MIME type
        if (tempFilename.endsWith(".jpg") || tempFilename.endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (tempFilename.endsWith(".webp")) {
            contentType = "image/webp";
        } else if (tempFilename.endsWith(".gif")) {
            contentType = "image/gif";
        } else if (tempFilename.endsWith(".bmp")) {
            contentType = "image/bmp";
        } else if (tempFilename.endsWith(".pdf")) {
            contentType = "application/pdf";
        }

        // Step 3: Upload to final location with correct MIME type
        await uploadBytes(finalRef, fileData, { contentType });

        // Step 4: Get public download URL
        const finalURL = await getDownloadURL(finalRef);


        // Step 5: Delete temp file after successful move
        await deleteObject(tempRef);


        return finalURL;
    } catch (error) {
        console.error("Error finalizing image upload:", error);
        return null;
    }
};

/**
 * Delete an image from Firebase Storage
 * 
 * @param {string} folder - The folder containing the file
 * @param {string} filename - The filename to delete
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const deleteImageFromStorage = async (folder, filename) => {
    try {
        const fileRef = ref(storage, `${folder}/${filename}`);
        await deleteObject(fileRef);

        return true;
    } catch (error) {
        console.error(`Error deleting ${folder}/${filename}:`, error);
        return false;
    }
};

/**
 * Delete old images with different extensions
 * Used when uploading a new image to replace old ones
 * 
 * @param {string} folder - The folder containing the files
 * @param {string} baseFileName - The base filename without extension
 * @param {Array<string>} extensions - Array of extensions to try (default: common image extensions)
 * @returns {Promise<void>}
 */
export const deleteOldImageVersions = async (
    folder,
    baseFileName,
    extensions = ["jpg", "jpeg", "png", "webp", "gif", "bmp"]
) => {
    const deletePromises = extensions.map(async (ext) => {
        const filename = `${baseFileName}.${ext}`;
        const fileRef = ref(storage, `${folder}/${filename}`);

        try {
            await deleteObject(fileRef);

        } catch (error) {
            // File might not exist, which is fine
            if (error.code !== "storage/object-not-found") {
                console.warn(`Could not delete ${folder}/${filename}:`, error.message);
            }
        }
    });

    await Promise.all(deletePromises);
};
