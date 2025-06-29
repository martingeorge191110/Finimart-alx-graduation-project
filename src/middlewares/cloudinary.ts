#!/usr/bin/env ts-node
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import ApiError from "./error.handler";

dotenv.config();

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadCloudinaryPDF = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const auth_letter = req.file;

   if (!auth_letter)
      return next(ApiError.create_error("No Files have been uploaded!", 400));

   try {
      const data = await fs.readFile(auth_letter.path);

      const result = await new Promise((resolve, reject) => {
         const stream = cloudinary.uploader.upload_stream(
            {
               resource_type: "raw",
               type: "private",
               folder: "AuthorizationLetters",
            },
            (error, result) => {
               if (error) if (error) return reject(error);
               resolve(result);
            }
         );
         stream.end(data);
      });

      const publicId = (result as any).public_id;

      (req as any).auth_letter_public_id = publicId;

      await fs.unlink(auth_letter.path);
      return next();
   } catch (err) {
      console.log(err);
      return next(
         ApiError.create_error(
            "cloudinary server error during upload the photo",
            500
         )
      );
   }
};

/**
 * Deletes an image from Cloudinary using its full URL
 * @param imageUrl Full Cloudinary image URL
 */
export const deleteCloudinaryImage = async (
   imageUrl: string
): Promise<boolean> => {
   try {
      // Example: https://res.cloudinary.com/demo/image/upload/v1625841212/products/abcd1234.png
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/"); // ['/', 'demo', 'image', 'upload', 'v123...', 'products', 'abcd1234.png']

      // Remove 'v...'(version), get everything after 'upload'
      const uploadIndex = pathParts.findIndex(p => p === "upload");
      const publicPathParts = pathParts.slice(uploadIndex + 1);
      const filenameWithExt = publicPathParts.pop(); // abcd1234.png
      const filename = filenameWithExt?.split(".")[0] ?? "";
      const folderPath = publicPathParts.join("/"); // products (or nested folders)

      const publicId = folderPath ? `${folderPath}/${filename}` : filename;
      console.log("publicId to delete:", publicId);
      const result = await cloudinary.uploader.destroy(publicId);

      return result.result === "ok" || result.result === "not found"; // treat "not found" as success
   } catch (error) {
      console.error("Failed to delete image:", error);
      return false;
   }
};

/**
 * Uploads a photo to Cloudinary with public access
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const uploadCloudinaryPhoto = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const photo = req.file;

   if (!photo)
      return next(ApiError.create_error("No photo has been uploaded!", 400));

   try {
      const data = await fs.readFile(photo.path);

      const result = await new Promise((resolve, reject) => {
         const stream = cloudinary.uploader.upload_stream(
            {
               resource_type: "image",
               folder: "Products",
               // Making the upload public by default
               access_mode: "public",
            },
            (error, result) => {
               if (error) return reject(error);
               resolve(result);
            }
         );
         stream.end(data);
      });

      // Store the Cloudinary URL in the request object for later use
      (req as any).product_img_url = (result as any).secure_url;

      // Clean up the temporary file
      await fs.unlink(photo.path);
      return next();
   } catch (err) {
      console.error("Cloudinary upload error:", err);
      return next(
         ApiError.create_error("Failed to upload photo to Cloudinary", 500)
      );
   }
};

/**
 * Uploads an image to Cloudinary and returns the URL and public ID
 * @param filePath Path to the temporary file
 * @param folder Optional folder name in Cloudinary (defaults to "Products")
 * @returns Object containing the secure URL and public ID of the uploaded image
 */
export const uploadImageToCloudinary = async (filePath: string, folder: string = "Products" ): Promise<{ secure_url: string; public_id: string }> => {
   try {
      const data = await fs.readFile(filePath);

      const result = await new Promise((resolve, reject) => {
         const stream = cloudinary.uploader.upload_stream(
            {
               resource_type: "image",
               folder,
               access_mode: "public",
            },
            (error, result) => {
               if (error) return reject(error);
               resolve(result);
            }
         );
         stream.end(data);
      });

      // Clean up the temporary file
      await fs.unlink(filePath);

      return {
         secure_url: (result as any).secure_url,
         public_id: (result as any).public_id
      };
   } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw new Error("Failed to upload image to Cloudinary");
   }
};

/**
 * Generates a temporary download URL for a private PDF stored in Cloudinary
 * @param publicId The public ID of the PDF in Cloudinary
 * @param durationInSeconds Duration in seconds for which the URL should be valid (default: 1 hour)
 * @returns The temporary download URL for the PDF
 */
export const getTemporaryPDFUrl = async ( publicId: string, durationInSeconds: number = 3600 ): Promise<string> => {
   try {
      // Generate a signed URL that expires after the specified duration
      const url = cloudinary.url(publicId, {
         resource_type: "raw",
         type: "private",
         sign_url: true,
         expires_at: Math.floor(Date.now() / 1000) + durationInSeconds,
         attachment: true, // This will force the browser to download the file
      });

      return (url);
   } catch (error) {
      throw new Error("Failed to generate temporary download URL for PDF");
   }
};
