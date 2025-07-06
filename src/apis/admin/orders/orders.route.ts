#!/usr/bin/env node
import { Router } from "express";
import { isAdminAccount, verifyAdminToken } from "../../../middlewares/admin.middlewares";
import adminOrderValidator from "./orders.validator";
import ApiError from "../../../middlewares/error.handler";
import adminOrderController from "./orders.controller";


const AdminOrderRoutes: Router = Router();

AdminOrderRoutes.use( verifyAdminToken, isAdminAccount );

AdminOrderRoutes.route("/")
   .get(
      adminOrderValidator.ordersPaginationValid(), ApiError.validation_error,
      adminOrderController.GetOrderPagination
   )

export default AdminOrderRoutes;
