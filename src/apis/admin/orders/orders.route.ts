#!/usr/bin/env node
import { Router } from "express";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import adminOrderValidator from "./orders.validator";
import ApiError from "../../../middlewares/error.handler";
import adminOrderController from "./orders.controller";


const AdminOrderRoutes: Router = Router();

AdminOrderRoutes.use(verifyAdminToken, isAdminAccount);

/**
 * @swagger
 * /api/v1/admin/orders/:
 *   get:
 *     summary: Get paginated/filterable list of orders
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: search_by_company
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: order_by
 *         schema:
 *           type: string
 *           enum: [desc, esc]
 *         required: false
 *       - in: query
 *         name: created_at
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Confirmed, Cancelled, Returned]
 *         required: false
 *     responses:
 *       200:
 *         description: List of orders
 */
AdminOrderRoutes.route("/")
   .get(
      adminOrderValidator.ordersPaginationValid(), ApiError.validation_error,
      adminOrderController.GetOrderPagination
   )

/**
 * @swagger
 * /api/v1/admin/orders/{order_id}/:
 *   get:
 *     summary: Get specific order details
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *   patch:
 *     summary: Update order status and payment status
 *     tags: [Admin Orders]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Confirmed, Cancelled, Returned]
 *               payment_status:
 *                 type: string
 *                 enum: [UnPaid, Paid, ReFunded]
 *     responses:
 *       200:
 *         description: Order updated
 */
AdminOrderRoutes.route("/:order_id/")
   .get(
      adminOrderValidator.orderIDValid(), ApiError.validation_error,
      adminOrderController.GetSpecificOrderDetails
   )
   .patch(
      adminOrderValidator.updateOrderStatusAndPaymentValid(), ApiError.validation_error,
      adminOrderController.UpdateOrderStatusAndPayment
   )

export default AdminOrderRoutes;
