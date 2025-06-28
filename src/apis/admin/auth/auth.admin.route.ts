#!/usr/bin/env node
import { Router } from "express";
import AdminAuthValidator from "./auth.admin.validator";
import ApiError from "../../../middlewares/error.handler";
import AdminAuthController from "./auth.admin.controller";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/verify.admin.token";
// import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";


const AdminAuthRoute: Router = Router();

AdminAuthRoute.route("/login/")
   .post(
      AdminAuthValidator.loginValid(), ApiError.validation_error,
      AdminAuthController.Login
   );

AdminAuthRoute.route("/refresh-token/")
   .post(
      AdminAuthValidator.refreshTokenValid(), ApiError.validation_error,
      AdminAuthController.RefreshToken
   );

AdminAuthRoute.route("/logout/")
   .post(
      AdminAuthValidator.refreshTokenValid(), ApiError.validation_error,
      verifyAdminToken, isAdminAccount,
      AdminAuthController.Logout
   );

AdminAuthRoute.route("/is-authenticated/")
   .get(
      verifyAdminToken, isAdminAccount,
      AdminAuthController.isAuthenticated
   )

export default AdminAuthRoute;
