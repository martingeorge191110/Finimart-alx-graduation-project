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
   validateOrdersList
} = companyValidator;

const {
   Dashboard,
   GetPendingOrders, GetOrdersHistory
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

CompanyRoutes.route("/pending-orders/") // req.query : { order_no?: number }
   .get(
      validateOrdersList(), ApiError.validation_error,
      GetPendingOrders
   )

CompanyRoutes.route("/orders-history/") // req.query : { order_no?: number }
   .get(
      validateOrdersList(), ApiError.validation_error,
      GetOrdersHistory // confirmed and completed orders
   )

export default CompanyRoutes;
