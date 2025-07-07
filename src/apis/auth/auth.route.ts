#!/usr/bin/env ts-node
import { Router } from "express";
import { authValidation } from "./auth.validation";
import ApiError from "../../middlewares/error.handler";
import { authController } from "./auth.controller";
import { verifyToken } from "../../middlewares/verify.token";
import { MulterPDFUploader } from "../../middlewares/multer.uploader";
import { uploadCloudinaryPDF } from "../../middlewares/cloudinary";


const AuthRouter: Router = Router();


/**
 * @swagger
 * /api/v1/auth/login/:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, accept_cookies]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               accept_cookies:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or validation error
 *       404:
 *         description: User not found
 */
AuthRouter.route("/login/")
   .post(
      authValidation.loginValidation(), ApiError.validation_error,
      authController.Login
   );

/**
 * @swagger
 * /api/v1/auth/register/:
 *   post:
 *     summary: User and company registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - confirm_password
 *               - phone_number_user
 *               - company_name
 *               - origin
 *               - phone_number_company
 *               - address_company
 *               - city_company
 *               - country_company
 *               - auth_letter
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *               phone_number_user:
 *                 type: string
 *               company_name:
 *                 type: string
 *               origin:
 *                 type: string
 *               website_url:
 *                 type: string
 *               phone_number_company:
 *                 type: string
 *               fax_number:
 *                 type: string
 *               address_company:
 *                 type: string
 *               city_company:
 *                 type: string
 *               country_company:
 *                 type: string
 *               auth_letter:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Register successful
 *       400:
 *         description: Validation error
 */
AuthRouter.route("/register/")
   .post(
      MulterPDFUploader("auth_letters").single("auth_letter"),
      authValidation.registerValidation(), ApiError.validation_error,
      uploadCloudinaryPDF,
      authController.Register
   );

/**
 * @swagger
 * /api/v1/auth/send-otp-code/:
 *   post:
 *     summary: Send OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP code sent
 *       404:
 *         description: User not found
 */
AuthRouter.route("/send-otp-code/")
   .post(
      authValidation.sendOtpCodeValidation(), ApiError.validation_error,
      authController.SendOtpCode
   );

/**
 * @swagger
 * /api/v1/auth/verify-otp-code/:
 *   put:
 *     summary: Verify OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp_code]
 *             properties:
 *               email:
 *                 type: string
 *               otp_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP code verified
 *       400:
 *         description: Invalid OTP code
 *       404:
 *         description: User not found
 */
AuthRouter.route("/verify-otp-code/")
   .put(
      authValidation.verifyOtpCodeValidation(), ApiError.validation_error,
      authController.VerifyOtpCode
   );

/**
 * @swagger
 * /api/v1/auth/reset-password/:
 *   put:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, new_password, confirm_new_password]
 *             properties:
 *               email:
 *                 type: string
 *               new_password:
 *                 type: string
 *               confirm_new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
AuthRouter.route("/reset-password/")
   .put(
      authValidation.resetPasswordValidation(), ApiError.validation_error,
      authController.ResetPassword
   );

/**
 * @swagger
 * /api/v1/auth/logout/:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
AuthRouter.route("/logout/")
   .post(
      authValidation.refreshTokenValidation(), ApiError.validation_error,
      verifyToken,
      authController.Logout
   );

/**
 * @swagger
 * /api/v1/auth/refresh-token/:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 *       404:
 *         description: Refresh token or user not found
 */
AuthRouter.route("/refresh-token/")
   .post(
      authValidation.refreshTokenValidation(), ApiError.validation_error,
      authController.RefreshToken
   );

/**
 * @swagger
 * /api/v1/auth/is-authinticated/:
 *   get:
 *     summary: Check if user is authenticated
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: Unauthorized
 */
AuthRouter.route("/is-authinticated/")
   .get(
      verifyToken, authController.IsAuthinticated
   )

export { AuthRouter };
