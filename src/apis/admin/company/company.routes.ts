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

AdminCompanyRoutes.route("/:company_id/verify/")
   .put(
      adminCompanyValidator.companyParamIDValidDB(), ApiError.validation_error,
      adminCompanyController.VerifyCompanyAccount
   )

AdminCompanyRoutes.route("/:company_id/block/")
   .put(
      adminCompanyValidator.blockCompanyAccValid(), ApiError.validation_error,
      adminCompanyController.BlockCompanyAccount
   )

AdminCompanyRoutes.route("/:company_id/auth-letter/")
   .get(
      adminCompanyValidator.companyParamIDValidDB(), ApiError.validation_error,
      adminCompanyController.CompanyAuthLetter
   )

AdminCompanyRoutes.route("/:company_id/wallet/")
   .put(
      adminCompanyValidator.updateCompanyWalletValid(), ApiError.validation_error,
      adminCompanyController.UpdateCompanyWallet
   )

AdminCompanyRoutes.route("/wallets/")
   .get(
      adminCompanyValidator.getAllCompanyWalletsValidWithFilter(), ApiError.validation_error,
      adminCompanyController.GetAllCompanyWallets
   )

export default AdminCompanyRoutes;
