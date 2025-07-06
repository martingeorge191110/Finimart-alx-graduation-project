#!/usr/bin/env node
import { Router } from "express";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import adminSpecsValidator from "./specs.validator";
import ApiError from "../../../middlewares/error.handler";
import adminSpecsController from "./specs.controller";
import AdminAPIRoute from "../admin.api.route";


const AdminSpecsRoutes: Router = Router();

AdminSpecsRoutes.use( verifyAdminToken, isAdminAccount );


AdminSpecsRoutes.route("/")
   .post(
      adminSpecsValidator.addNewSpecsValid(), ApiError.validation_error,
      adminSpecsController.AddNewSpecs
   )
   .get(
      adminSpecsController.GetSpecDefinations
   )

AdminSpecsRoutes.route("/:specs_id/")
   .put(
      adminSpecsValidator.updateSpecsValid(), ApiError.validation_error,
      adminSpecsController.UpdateSpecDefination
   )

AdminSpecsRoutes.route("/:specs_id/")
   .delete(
      adminSpecsValidator.deleteSpecsValid(), ApiError.validation_error,
      adminSpecsController.deletespecsdefination_by_id
   )

export default AdminSpecsRoutes;
