#!/usr/bin/env node
import { Router } from "express";
import AdminAuthValidator from "./auth.admin.validator";
import ApiError from "../../../middlewares/error.handler";
import AdminAuthController from "./auth.admin.controller";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";


const AdminAuthRoute: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           minLength: 10
 *           maxLength: 55
 *           description: Admin's email address
 *           example: admin@example.com
 *         password:
 *           type: string
 *           minLength: 10
 *           maxLength: 55
 *           description: Admin's password
 *           example: "securePassword123"
 *         device_id:
 *           type: string
 *           minLength: 5
 *           maxLength: 55
 *           description: Optional device identifier for refresh token management
 *           example: "device_123456"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Login successful"
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Admin's unique identifier
 *             email:
 *               type: string
 *               format: email
 *             role:
 *               type: string
 *               description: Admin's role
 *             access_token:
 *               type: string
 *               description: JWT access token
 *             refresh_token:
 *               type: string
 *               description: Refresh token for obtaining new access tokens
 *             device_id:
 *               type: string
 *               description: Device identifier associated with the refresh token
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Admin login endpoint
 *     description: Authenticates an admin user and returns access and refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: Contains access_token and refresh_token cookies
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Email or Password is not valid!"
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Wrong email or password!"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Server Failure"
 *     security: []
 */
AdminAuthRoute.route("/login/")
   .post(
      AdminAuthValidator.loginValid(), ApiError.validation_error,
      AdminAuthController.Login
   );

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token from cookies
 *     security: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Token refreshed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: New JWT access token
 *                     refresh_token:
 *                       type: string
 *                       description: Current refresh token
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: Contains new access_token cookie
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Refresh token expired, Please login again"
 *       404:
 *         description: Refresh token or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Refresh token not found"
 */
AdminAuthRoute.route("/refresh-token/")
   .post(
      AdminAuthValidator.refreshTokenValid(), ApiError.validation_error,
      AdminAuthController.RefreshToken
   );

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Admin logout endpoint
 *     description: Logs out an admin user by revoking their refresh token and clearing cookies
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       401:
 *         description: Unauthorized - Invalid or revoked refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Refresh token revoked"
 *       404:
 *         description: Refresh token not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Refresh token not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Server Failure"
 */
AdminAuthRoute.route("/logout/")
   .post(
      AdminAuthValidator.refreshTokenValid(), ApiError.validation_error,
      verifyAdminToken, AdminAuthController.Logout
   );

AdminAuthRoute.route("/is-authenticated/")
   .get(
      verifyAdminToken, isAdminAccount,
      AdminAuthController.isAuthenticated
   )

export default AdminAuthRoute;
