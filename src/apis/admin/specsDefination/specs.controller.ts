#!/usr/bin/env node

import { NextFunction, Request, Response } from "express";
import adminSpecsService from "./specs.service";
import ApiError from "../../../middlewares/error.handler";
import globalUtils from "../../../utils/globals";
import { Specs_Defination } from "../../../../generated/prisma";



class AdminSpecsControllerClass {
   private service;
   constructor () {
      this.service = adminSpecsService;
   }


   public static createInstance = () => (new AdminSpecsControllerClass())

   public AddNewSpecs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { key_name, unit } = req.body;

      try {
         const newSpecs = await this.service.createSpecsDef(key_name, unit);
         await this.service.resetSpecsDefinationsRedis();
         return globalUtils.SuccessfulyResponseJson(res, 201, "Successfully created specs definition", { ...newSpecs });
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public GetSpecDefinations = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const allSpecsDifinationsRedis = await this.service.getAllSpecsRedis();
         if (allSpecsDifinationsRedis) {
            const parsedData = JSON.parse(allSpecsDifinationsRedis);
            return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived specs definations from Cache!", parsedData));
         }
         const allSpecsDifinationsDB = await this.service.getAllSpecsDB();

         await this.service.setSpecsDefinationsRedis(allSpecsDifinationsDB);

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly retreived specs definations from DB!", [...allSpecsDifinationsDB]));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public UpdateSpecDefination = async (req: Request, res: Response, next: NextFunction) => {
      const { specs_id } = req.params;
      const { key_name, unit } = req.body;

      try {
         const specsDB = await this.service.getSepcsByIDDB(specs_id);
         if (!specsDB)
            return (next(ApiError.create_error("Cannot find Specs defination", 404)));
         const updated_specs = await this.service.updateSpecsDefination(
            specs_id, key_name ? key_name : specsDB.key_name, unit ? unit : specsDB.unit
         )
         await this.service.resetSpecsDefinationsRedis();

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly specs defination updated", { ...updated_specs }));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }

   public deletespecsdefination_by_id = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { specs_id } = req.params;

      try {
         const specsDB = await this.service.getSepcsByIDDB(specs_id);
         if (!specsDB)
            return (next(ApiError.create_error("Cannot find Specs defination", 404)));
         const deletedSpecs = await this.service.deletespecsdefination_by_id(specs_id);
         await this.service.resetSpecsDefinationsRedis();

         return (globalUtils.SuccessfulyResponseJson(res, 200, "Successfuly specs defination deleted", {}));
      } catch (err) {
         return (next(ApiError.create_error(String(err), 500)));
      }
   }
}

const adminSpecsController = AdminSpecsControllerClass.createInstance();
export default adminSpecsController;
