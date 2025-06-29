#!/usr/bin/env ts-node
import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * @description This function is used to upload the PDF Auth Letter temporarily on the server
 * @param dirName - Dir name that will upload the PDF files on temporarily
 * @returns multer object the including the PDF files info and the limit of the PDF files
 */
const MulterPDFUploader = (dirName: string) => {
   const pathCwd = process.cwd().split("/");
   let str = "";
   for (let i = 0; i < pathCwd.length; i++) {
      if (i === pathCwd.length) break;
      str += pathCwd[i] + "/";
   }

   const storage = multer.diskStorage({
      destination: (req, file, cb) => {
         const fullPath = path.join(str, dirName);
         if (fs.existsSync(fullPath)) {
            cb(null, fullPath);
         } else {
            try {
               fs.mkdirSync(fullPath, { recursive: true });
               cb(null, fullPath);
            } catch (err) {
               console.error("Error creating directory:", err);
               cb(err as Error, "");
            }
         }
      },
      filename: (req, file, cb) => {
         cb(null, Date.now() + "-" + file.originalname);
      },
   });

   return multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
         if (file.mimetype === "application/pdf") {
            cb(null, true);
         } else {
            cb(new Error("Only PDF files are allowed!"));
         }
      },
   });
};

/**
 * @description This function is used to upload images temporarily on the server
 * @param dirName - Directory name where images will be uploaded temporarily
 * @returns multer object including the image files info and upload limits
 */
const MulterIMGUploader = (dirName: string) => {
   const pathCwd = process.cwd().split("/");
   let str = "";
   for (let i = 0; i < pathCwd.length; i++) {
      if (i === pathCwd.length) break;
      str += pathCwd[i] + "/";
   }

   const storage = multer.diskStorage({
      destination: (req, file, cb) => {
         const fullPath = path.join(str, dirName);
         if (fs.existsSync(fullPath)) {
            cb(null, fullPath);
         } else {
            try {
               fs.mkdirSync(fullPath, { recursive: true });
               cb(null, fullPath);
            } catch (err) {
               console.error("Error creating directory:", err);
               cb(err as Error, "");
            }
         }
      },
      filename: (req, file, cb) => {
         // Generate a unique filename with original extension
         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
         const ext = path.extname(file.originalname);
         cb(null, uniqueSuffix + ext);
      },
   });

   // Define allowed image MIME types
   const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
   ];

   return multer({
      storage,
      limits: {
         fileSize: 10 * 1024 * 1024, // 10MB limit
         files: 5, // Maximum 5 files per upload
      },
      fileFilter: (req, file, cb) => {
         if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
         } else {
            cb(
               new Error("Invalid File has been uploaded!")
            );
         }
      },
   });
};

export { MulterPDFUploader, MulterIMGUploader };
