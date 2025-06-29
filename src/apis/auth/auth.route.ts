#!/usr/bin/env ts-node
import { Router } from "express";
import { authValidation } from "./auth.validation";
import ApiError from "../../middlewares/error.handler";
import { authController } from "./auth.controller";
import { verifyToken } from "../../middlewares/verify.token";
import { MulterPDFUploader } from "../../middlewares/multer.uploader";
import { uploadCloudinaryPDF } from "../../middlewares/cloudinary";


const AuthRouter: Router = Router();


AuthRouter.route("/login/")
   .post(
      authValidation.loginValidation(), ApiError.validation_error,
      authController.Login
   );

AuthRouter.route("/register/")
   .post(
      MulterPDFUploader("auth_letters").single("auth_letter"),
      authValidation.registerValidation(), ApiError.validation_error,
      uploadCloudinaryPDF,
      authController.Register
   );

AuthRouter.route("/logout/")
   .post(
      authValidation.refreshTokenValidation(), ApiError.validation_error,
      verifyToken,
      authController.Logout
   );

AuthRouter.route("/refresh-token/")
   .post(
      authValidation.refreshTokenValidation(), ApiError.validation_error,
      authController.RefreshToken
   );

AuthRouter.route("/is-authinticated/")
   .get(
      verifyToken, authController.IsAuthinticated
   )

export { AuthRouter };
