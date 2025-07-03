#!/usr/bin/env node
import { Router } from "express";
import adminCompanyController from "./company.controller";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import ApiError from "../../../middlewares/error.handler";
import adminCompanyValidator from "./company.validator";

const AdminCompanyRoutes: Router = Router();

AdminCompanyRoutes.use( verifyAdminToken, isAdminAccount );



AdminCompanyRoutes.route("/") // --> its contains some query! (?filteration process)
   .get(
      adminCompanyValidator.companyListFilterationValid(), ApiError.validation_error,
      adminCompanyController.CompaniesList
   )

export default AdminCompanyRoutes;
