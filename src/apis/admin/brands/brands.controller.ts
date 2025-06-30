#!/usr/bin/env node
import { NextFunction, Request, Response } from "express";
import adminBrandsService from "./brands.services";
import ApiError from "../../../middlewares/error.handler";
import globalUtils from "../../../utilies/globals";




class AdminBrandsControllerClass {
   private services;

   constructor () {
      this.services = adminBrandsService;
   }

   public AddNewBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { name, brand_img_url } = req.body;

      try {
         const newBrandRecord = await this.services.createNewBrand(name, brand_img_url);

         return (globalUtils.SuccessfulyResponseJson(res, 201, "New Brand has been added!", {...newBrandRecord}));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public getBrands = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const brands = await this.services.getAllBrands();

         return (globalUtils.SuccessfulyResponseJson(res, 200, "successfully Retreived the Brands!", brands));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public updateBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { brand_id } = req.params;
      const { name, brand_img_url } = req.body;

      try {
         const updatedBrand = await this.services.updateBrand(brand_id, name, brand_img_url);

         if (!updatedBrand) {
            return next(ApiError.create_error("Brand not found.", 404));
         }

         return globalUtils.SuccessfulyResponseJson(res, 200, "Brand has been updated successfully!", updatedBrand);
      } catch (err) {
         return next(ApiError.create_error(String(err), 500));
      }
   }

   public deleteBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { brand_id } = req.params;

      try {
         const deletedBrand = await this.services.deleteBrand(brand_id);

         if (!deletedBrand) {
            return next(ApiError.create_error("Brand not found.", 404));
         }

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Brand has been deleted successfully!", deletedBrand));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const adminBrandsController = new AdminBrandsControllerClass();
export default adminBrandsController;
