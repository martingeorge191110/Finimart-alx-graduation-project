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
   isSuperUser,
} = CompanyMiddlewares.getInstance();

const {
   companyParamIDValidDB,
   validateOrdersList,
   validateCreateUser
} = companyValidator;

const {
   Dashboard,
   GetPendingOrders, GetOrdersHistory,
   GetCompanyUsers, CreateUser
} = companyController;

CompanyRoutes.use(
   verifyToken, isComapnyExists, isCompanyValid
);

/**
 * @swagger
 * /api/v1/company/{company_id}/dashboard:
 *   get:
 *     summary: Get company dashboard
 *     description: Retrieve company dashboard statistics including total paid, pending orders, and total orders. Uses Redis caching.
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           minLength: 5
 *           maxLength: 55
 *         description: Company UUID
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */
CompanyRoutes.route("/:company_id/dashboard/")
   .get(
      UserCompanyIDs,
      companyParamIDValidDB(), ApiError.validation_error,
      Dashboard
   )

/**
 * @swagger
 * /api/v1/company/pending-orders:
 *   get:
 *     summary: Get pending orders
 *     description: Retrieve paginated list of pending orders for the company.
 *     tags: [Company]
 *     parameters:
 *       - in: query
 *         name: order_no
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by order number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: Limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Orders per page
 *     responses:
 *       200:
 *         description: Pending orders retrieved successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
CompanyRoutes.route("/pending-orders/") // req.query : { order_no?: number }
   .get(
      validateOrdersList(), ApiError.validation_error,
      GetPendingOrders
   )

/**
 * @swagger
 * /api/v1/company/orders-history:
 *   get:
 *     summary: Get orders history
 *     description: Retrieve paginated list of confirmed and completed orders for the company.
 *     tags: [Company]
 *     parameters:
 *       - in: query
 *         name: order_no
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by order number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: Limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Orders per page
 *     responses:
 *       200:
 *         description: Orders history retrieved successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
CompanyRoutes.route("/orders-history/") // req.query : { order_no?: number }
   .get(
      validateOrdersList(), ApiError.validation_error,
      GetOrdersHistory // confirmed and completed orders
   )

/**
 * @swagger
 * /api/v1/company/users:
 *   get:
 *     summary: Get company users
 *     description: Retrieve all users for the company (no pagination, max 10 users per company).
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: Company users retrieved successfully
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create new user
 *     description: Create a new user for the company. Maximum 10 users per company allowed. Requires super user role.
 *     tags: [Company]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - confirm_password
 *               - phone_number
 *               - role
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: User's first name
 *               last_name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 minLength: 10
 *                 maxLength: 200
 *                 description: User's email (must be unique)
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 200
 *                 description: User's password
 *               confirm_password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 200
 *                 description: Password confirmation
 *               phone_number:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 15
 *                 description: Egyptian phone number (must be unique)
 *               role:
 *                 type: string
 *                 enum: [Controller, Sub_Controller, Order_Maker]
 *                 description: User role
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Maximum users reached or permission denied
 *       500:
 *         description: Server error
 */
CompanyRoutes.route("/users/")
   .get(
      GetCompanyUsers // no pagination, each company just has at most 10 users accounts
   )
   .post(
      isSuperUser,
      validateCreateUser(), ApiError.validation_error,
      CreateUser
   )

export default CompanyRoutes;
