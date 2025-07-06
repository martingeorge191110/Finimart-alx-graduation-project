#!/usr/bin/env node
import { Router } from "express";
import { verifyToken } from "../../middlewares/verify.token";
import { companyValidator } from "./company.validator";
import ApiError from "../../middlewares/error.handler";
import { UserCompanyIDs } from "../../middlewares/user.roles";
import companyController from "./company.controller";
import CompanyMiddlewares from "../../middlewares/company.middleware";

const CompanyRoutes: Router = Router();

const {
   isComapnyExists,
   isCompanyValid,
} = CompanyMiddlewares.getInstance();

const {
   companyParamIDValidDB,
} = companyValidator;

const {
   Dashboard
} = companyController;

CompanyRoutes.use(
   verifyToken, isComapnyExists, isCompanyValid
);


CompanyRoutes.route("/:company_id/dashboard/")
   .get(
      UserCompanyIDs,
      companyParamIDValidDB(), ApiError.validation_error,
      Dashboard
   )

export default CompanyRoutes;
