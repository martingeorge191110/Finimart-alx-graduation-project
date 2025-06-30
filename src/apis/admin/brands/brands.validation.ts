#!/usr/bin/env node
import { body, Meta, ValidationChain, param } from "express-validator";
import adminBrandsService from "./brands.services";



class AdminBrandsValidatorClass {
   private services;

   constructor() {
      this.services = adminBrandsService;
   }

   public addNewBrandValidation = (): ValidationChain[] => ([
      body("name")
         .trim().notEmpty().withMessage("Brand Name is Required!")
         .custom(async (val: string, { req }: Meta): Promise<boolean | void> => {
            try {
               if (await this.services.findBrandByName(val))
                  throw (new Error("You have a brand with same name"));

               return (true);
            } catch (err) {
               throw (err)
            }
         }),
      body("brand_img_url")
         .trim().notEmpty().withMessage("Brand Img URL is Required!")
         .isURL().withMessage("Must be a valid URL!")
         .custom((value) => {
            // const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
            const url = value.toLowerCase();

            // const isValidExtension = allowedExtensions.some(ext => url.endsWith(ext));
            // if (!isValidExtension) {
            //    throw new Error("Image URL must end with a valid image extension (.jpg, .png, etc)");
            // }
            return (true);
         })
   ])

   public updateBrandValidation = (): ValidationChain[] => ([
      param("brand_id")
         .notEmpty().withMessage("brand_id is required")
         .isUUID().withMessage("brand_id must be a valid UUID"),

      body().custom(body => {
         if (!body.name && !body.brand_img_url) {
            throw new Error("At least one of 'name' or 'brand_img_url' must be provided");
         }
         return true;
      }),

      body("name")
         .optional()
         .isString().withMessage("name must be a string")
         .isLength({ min: 2, max: 50 }).withMessage("name must be between 2 and 50 characters"),

      body("brand_img_url")
         .optional()
         .isString().withMessage("brand_img_url must be a string")
         .isURL().withMessage("brand_img_url must be a valid URL"),
   ]);

   public deleteBrandValidation = (): ValidationChain[] => ([
      param("brand_id")
         .notEmpty().withMessage("brand_id is required")
         .isUUID().withMessage("brand_id must be a valid UUID")
   ]);
}

const adminBrandsValidation = new AdminBrandsValidatorClass();
export default adminBrandsValidation;
