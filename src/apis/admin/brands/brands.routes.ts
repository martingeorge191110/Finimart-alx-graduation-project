#!/usr/bin/env node
import { Router } from "express";
import adminBrandsController from "./brands.controller";
import adminBrandsValidation from "./brands.validation";
import ApiError from "../../../middlewares/error.handler";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/verify.admin.token";
const BrandsRoutes: Router = Router();

BrandsRoutes.use(verifyAdminToken, isAdminAccount);

BrandsRoutes.route("/")
   .post(
      adminBrandsValidation.addNewBrandValidation(),
      ApiError.validation_error,
      adminBrandsController.AddNewBrand
   )
   .get(adminBrandsController.getBrands);

BrandsRoutes.route("/:brand_id/")
   .put(
      adminBrandsValidation.updateBrandValidation(),
      ApiError.validation_error,
      adminBrandsController.updateBrand
   )
   .delete(
      adminBrandsValidation.deleteBrandValidation(),
      ApiError.validation_error,
      adminBrandsController.deleteBrand
   );

export default BrandsRoutes;
