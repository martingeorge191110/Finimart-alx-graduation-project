#!/usr/bin/env node
import { Router } from "express";
import { verifyToken } from "../../middlewares/verify.token";
import orderController from "./order.controller";
import orderValidator from "./order.validator";
import ApiError from "../../middlewares/error.handler";
import CompanyMiddlewares from "../../middlewares/company.middleware";

const OrderRoutes: Router = Router();
const {
   isUserController
} = CompanyMiddlewares.getInstance();

const {
   createOrderValidation
} = orderValidator;

const {
   CreateOrder
} = orderController;

OrderRoutes.use(verifyToken);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create new order
 *     description: Create a new order from cart items. Requires controller role. Validates stock availability and product status.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address_id:
 *                 type: string
 *                 format: uuid
 *                 description: Delivery address ID (optional, uses default if not provided)
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *       400:
 *         description: Cart empty, insufficient stock, or product unavailable
 *       403:
 *         description: Permission denied or address not owned by company
 *       500:
 *         description: Server error
 */
OrderRoutes.route("/")
   .post(
      isUserController,
      createOrderValidation(), ApiError.validation_error,
      CreateOrder
   );

export default OrderRoutes;
