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
   isSuperUser, isUserController
} = CompanyMiddlewares.getInstance();

const {
   companyParamIDValidDB,
   validateOrdersList,
   validateCreateUser, validateUserID,
   validateUserRole, validateDeliveryAddress,
   validateAddressID, validateUpdateAddress
} = companyValidator;

const {
   Dashboard,
   GetPendingOrders, GetOrdersHistory,
   GetCompanyUsers, CreateUser, DeleteUser,
   UpdateUserRole, GetCompanyAddresses,
   AddDeliveryAddress, DeleteDeliveryAddress,
   UpdateAddress, GetProfile
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

/**
 * @swagger
 * /api/v1/company/users/{user_id}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user from the company. Requires controller role.
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update user role
 *     description: Update a user's role. Cannot change your own role. Requires controller role.
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_role
 *             properties:
 *               user_role:
 *                 type: string
 *                 enum: [Controller, Sub_Controller, Order_Maker]
 *                 description: New user role
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Permission denied or cannot change own role
 *       500:
 *         description: Server error
 */
CompanyRoutes.route("/users/:user_id/")
   .all(isUserController)
   .delete(
      validateUserID(), ApiError.validation_error,
      DeleteUser
   )
   .patch(
      validateUserRole(), ApiError.validation_error,
      UpdateUserRole
   )

/**
 * @swagger
 * /api/v1/company/delivery_addresses:
 *   get:
 *     summary: Get company delivery addresses
 *     description: Retrieve all delivery addresses for the company (no pagination, max 10 addresses).
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: Delivery addresses retrieved successfully
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add delivery address
 *     description: Add a new delivery address for the company.
 *     tags: [Company]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street_address
 *               - city
 *               - country
 *             properties:
 *               street_address:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Street address
 *               city:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: City name
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Country name
 *               building_no:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Building number (optional)
 *               state_or_origin:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: State or origin (optional)
 *               notes:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 291
 *                 description: Additional notes (optional)
 *     responses:
 *       201:
 *         description: Delivery address added successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
CompanyRoutes.route("/delivery_addresses/")
   .get(
      GetCompanyAddresses // no pagination, each company just has at most 10 addresses
   )
   .post(
      validateDeliveryAddress(), ApiError.validation_error,
      AddDeliveryAddress
   )

/**
 * @swagger
 * /api/v1/company/delivery_addresses/{address_id}:
 *   delete:
 *     summary: Delete delivery address
 *     description: Delete a specific delivery address. Requires controller role.
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: address_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address UUID to delete
 *     responses:
 *       200:
 *         description: Delivery address deleted successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update delivery address
 *     description: Update a delivery address. Only company owner can update.
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: address_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address UUID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street_address:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Street address (optional)
 *               city:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: City name (optional)
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Country name (optional)
 *               building_no:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Building number (optional)
 *               state_or_origin:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: State or origin (optional)
 *               notes:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 291
 *                 description: Additional notes (optional)
 *     responses:
 *       200:
 *         description: Delivery address updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Server error
 */
CompanyRoutes.route("/delivery_addresses/:address_id/")
   .delete(
      isUserController,
      validateAddressID(), ApiError.validation_error,
      DeleteDeliveryAddress
   )
   .put(
      validateUpdateAddress(), ApiError.validation_error,
      UpdateAddress
   )

/**
 * @swagger
 * /api/v1/company/profile:
 *   get:
 *     summary: Get company profile
 *     description: Retrieve complete company profile including company details, user information, and wallet balance.
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: Company profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       type: object
 *                       description: Company details
 *                     user:
 *                       type: object
 *                       description: Current user information
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         balance:
 *                           type: number
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       500:
 *         description: Server error
 */
CompanyRoutes.route("/profile/")
   .get(
      GetProfile
   )

export default CompanyRoutes;
