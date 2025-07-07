#!/usr/bin/env node
import { Router } from "express";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import ApiError from "../../../middlewares/error.handler";
import AdminInvoicesController from "./invoices.controller";
import AdminInvoicesValidator from "./invoice.validator";

const AdminInvoicesRoutes: Router = Router();

AdminInvoicesRoutes.use(verifyAdminToken, isAdminAccount);

/**
 * @swagger
 * /api/v1/admin/invoices/:
 *   get:
 *     summary: Get all companies' invoices
 *     tags: [Admin Invoices]
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
 *         name: order_no
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *     responses:
 *       200:
 *         description: List of invoices
 */
AdminInvoicesRoutes.route("/")
    .get(
        AdminInvoicesValidator.getAllInvoicesValidator(), ApiError.validation_error,
        AdminInvoicesController.getAllCompaniesInvoices
    )

export default AdminInvoicesRoutes;
