#!/usr/bin/env node
import { Router } from "express";
import AdminAuthValidator from "./auth.admin.validator";
import ApiError from "../../../middlewares/error.handler";
import AdminAuthController from "./auth.admin.controller";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";


const AdminAuthRoute: Router = Router();

/**
 * @swagger
 * /api/v1/admin/auth/login/:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or validation error
 *       404:
 *         description: Admin not found
 */
AdminAuthRoute.route("/login/")
   .post(
      AdminAuthValidator.loginValid(), ApiError.validation_error,
      AdminAuthController.Login
   );

/**
 * @swagger
 * /api/v1/admin/auth/refresh-token/:
 *   post:
 *     summary: Refresh access token
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 *       404:
 *         description: Refresh token or user not found
 */
AdminAuthRoute.route("/refresh-token/")
   .post(
      AdminAuthValidator.refreshTokenValid(), ApiError.validation_error,
      AdminAuthController.RefreshToken
   );

/**
 * @swagger
 * /api/v1/admin/auth/logout/:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized or revoked refresh token
 *       404:
 *         description: Refresh token not found
 */
AdminAuthRoute.route("/logout/")
   .post(
      AdminAuthValidator.refreshTokenValid(), ApiError.validation_error,
      verifyAdminToken, AdminAuthController.Logout
   );

/**
 * @swagger
 * /api/v1/admin/auth/is-authenticated/:
 *   get:
 *     summary: Check if admin is authenticated
 *     tags: [Admin Auth]
 *     responses:
 *       200:
 *         description: Admin is authenticated
 *       401:
 *         description: Unauthorized
 */
AdminAuthRoute.route("/is-authenticated/")
   .get(
      verifyAdminToken, isAdminAccount,
      AdminAuthController.isAuthenticated
   )

export default AdminAuthRoute;
