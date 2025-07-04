#!/usr/bin/env node
import { Router } from "express";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import ApiError from "../../../middlewares/error.handler";
import AdminInvoicesController from "./invoices.controller";
import AdminInvoicesValidator from "./invoice.validator";

const AdminInvoicesRoutes: Router = Router();

AdminInvoicesRoutes.use( verifyAdminToken, isAdminAccount );

AdminInvoicesRoutes.route("/")
    .get(
        AdminInvoicesValidator.getAllInvoicesValidator(), ApiError.validation_error,
        AdminInvoicesController.getAllCompaniesInvoices
    )

export default AdminInvoicesRoutes;
